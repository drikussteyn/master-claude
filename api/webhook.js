import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hcatsoyfuorayhyqwyhd.supabase.co';
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.LEMON_WEBHOOK_SECRET;

// Steps to unlock per pack
const PACK1_IDS = [
  "3.1","3.2","3.3","3.4","3.5",
  "4.1","4.2","4.3","4.4","4.5",
  "5.1","5.2","5.3","5.4","5.5",
  "6.1","6.2","6.3","6.4","6.5",
  "7.1","7.2","7.3","7.4","7.5",
];
const PACK2_IDS = [
  "8.1","8.2","8.3","8.4","8.5",
  "9.1","9.2","9.3","9.4","9.5",
  "10.1","10.2","10.3","10.4","10.5",
];

const VARIANT_MAP = {
  '1608090': PACK1_IDS,   // Advanced Pack
  '1608129': PACK2_IDS,   // Expert Pack
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature
  const rawBody = JSON.stringify(req.body);
  const signature = req.headers['x-signature'];

  if (WEBHOOK_SECRET) {
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const digest = hmac.update(rawBody).digest('hex');
    if (signature !== digest) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  const event = req.body;
  const eventName = event?.meta?.event_name;

  // Only process successful orders
  if (eventName !== 'order_created') {
    return res.status(200).json({ received: true });
  }

  const order = event?.data?.attributes;
  const variantId = String(event?.data?.relationships?.order_items?.data?.[0]?.id || '');
  const customData = event?.meta?.custom_data || {};
  const userId = customData?.user_id;
  const userEmail = order?.user_email;

  if (!userId && !userEmail) {
    return res.status(400).json({ error: 'No user identifier in webhook' });
  }

  // Get the steps to unlock for this variant
  // Try to find variant in the order items
  const orderItems = event?.data?.relationships?.order_items;
  let stepsToUnlock = [];

  // Check all variants in the order
  const variantIdFromMeta = String(event?.data?.attributes?.first_order_item?.variant_id || '');
  stepsToUnlock = VARIANT_MAP[variantIdFromMeta] || [];

  // Fallback â€” check product ID
  if (stepsToUnlock.length === 0) {
    const productId = String(event?.data?.attributes?.first_order_item?.product_id || '');
    if (productId === '1025221') stepsToUnlock = PACK1_IDS;
    if (productId === '1025252') stepsToUnlock = PACK2_IDS;
  }

  if (stepsToUnlock.length === 0) {
    return res.status(400).json({ error: 'Unknown product variant' });
  }

  // Connect to Supabase with service role (server-side)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET);

  // Find user by ID or email
  let targetUserId = userId;

  if (!targetUserId && userEmail) {
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === userEmail);
    targetUserId = user?.id;
  }

  if (!targetUserId) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Get existing unlocked steps
  const { data: existing } = await supabase
    .from('user_progress')
    .select('unlocked_ids, total_paid')
    .eq('user_id', targetUserId)
    .single();

  const currentUnlocked = existing?.unlocked_ids || [];
  const currentPaid = existing?.total_paid || 0;
  const newUnlocked = [...new Set([...currentUnlocked, ...stepsToUnlock])];
  const amountPaid = order?.total ? order.total / 100 : 0;

  // Update Supabase
  await supabase.from('user_progress').upsert({
    user_id: targetUserId,
    unlocked_ids: newUnlocked,
    total_paid: currentPaid + amountPaid,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  return res.status(200).json({ success: true, unlocked: newUnlocked.length });
}
