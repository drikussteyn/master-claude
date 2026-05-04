import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hcatsoyfuorayhyqwyhd.supabase.co';
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;

// Numeric variant IDs → credits
const VARIANT_CREDITS = {
  '1608090': 500,
  '1608129': 1000,
};

const PRODUCT_CREDITS = {
  '1025221': 500,
  '1025252': 1000,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const event = req.body;
  if (event?.meta?.event_name !== 'order_created') return res.status(200).json({ received: true });

  const order     = event?.data?.attributes;
  const variantId = String(order?.first_order_item?.variant_id || '');
  const productId = String(order?.first_order_item?.product_id || '');
  const price     = order?.first_order_item?.price || 0;
  const userId    = event?.meta?.custom_data?.user_id;
  const userEmail = order?.user_email;

  let creditsToAdd = VARIANT_CREDITS[variantId] || PRODUCT_CREDITS[productId] || 0;
  if (!creditsToAdd) {
    if (price <= 100) creditsToAdd = 100;
    else if (price <= 500) creditsToAdd = 500;
    else creditsToAdd = 1000;
  }

  if (!userId && !userEmail) return res.status(400).json({ error: 'No user identifier' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET);

  let targetUserId = userId;
  if (!targetUserId && userEmail) {
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === userEmail);
    targetUserId = user?.id;
  }
  if (!targetUserId) return res.status(404).json({ error: 'User not found' });

  const { data: existing } = await supabase
    .from('user_progress')
    .select('credits')
    .eq('user_id', targetUserId)
    .single();

  const newCredits = (existing?.credits || 0) + creditsToAdd;

  await supabase.from('user_progress').upsert({
    user_id: targetUserId,
    credits: newCredits,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  return res.status(200).json({ success: true, credits: newCredits });
}
