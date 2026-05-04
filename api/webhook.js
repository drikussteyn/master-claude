import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = 'https://hcatsoyfuorayhyqwyhd.supabase.co';
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.LEMON_WEBHOOK_SECRET;

// Credit amounts per product variant
const VARIANT_CREDITS = {
  'dbbdfcfa-46cf-4b7f-9cfb-c71fea6ddfd6': 100,   // $1 = 100 credits
  'a2434402-0389-40bd-ac27-f44c721ab15d': 500,    // $5 = 500 credits
  '0a56ea97-80b0-4a39-864d-b2a27be528c7': 1000,   // $10 = 1000 credits
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verify webhook signature
  const rawBody = JSON.stringify(req.body);
  const signature = req.headers['x-signature'];
  if (WEBHOOK_SECRET && signature) {
    const digest = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
    if (signature !== digest) return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;
  if (event?.meta?.event_name !== 'order_created') return res.status(200).json({ received: true });

  const order      = event?.data?.attributes;
  const variantId  = String(order?.first_order_item?.variant_id || '');
  const customData = event?.meta?.custom_data || {};
  const userId     = customData?.user_id;
  const userEmail  = order?.user_email;
  const creditsToAdd = VARIANT_CREDITS[variantId] || 0;

  if (!creditsToAdd) return res.status(400).json({ error: `Unknown variant: ${variantId}` });
  if (!userId && !userEmail) return res.status(400).json({ error: 'No user identifier' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET);

  // Find user
  let targetUserId = userId;
  if (!targetUserId && userEmail) {
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === userEmail);
    targetUserId = user?.id;
  }
  if (!targetUserId) return res.status(404).json({ error: 'User not found' });

  // Get existing credits
  const { data: existing } = await supabase
    .from('user_progress')
    .select('credits')
    .eq('user_id', targetUserId)
    .single();

  const currentCredits = existing?.credits || 0;
  const newCredits = currentCredits + creditsToAdd;

  // Update credits
  await supabase.from('user_progress').upsert({
    user_id: targetUserId,
    credits: newCredits,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  return res.status(200).json({ success: true, credits: newCredits });
}
