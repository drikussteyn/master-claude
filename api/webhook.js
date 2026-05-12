const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hcatsoyfuorayhyqwyhd.supabase.co';

const VARIANT_CREDITS = {
  '1646675': 100,
  '1646704': 500,
  '1646707': 1000,
};

const PRODUCT_CREDITS = {
  '1025221': 500,
  '1025252': 1000,
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const event = req.body;

    if (event?.meta?.event_name !== 'order_created') {
      return res.status(200).json({ received: true });
    }

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

    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!secretKey) return res.status(500).json({ error: 'Missing SUPABASE_SECRET_KEY' });

    const supabase = createClient(SUPABASE_URL, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    let targetUserId = userId;
    if (!targetUserId && userEmail) {
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) return res.status(500).json({ error: 'List users failed: ' + listError.message });
      const user = users?.users?.find(u => u.email === userEmail);
      targetUserId = user?.id;
    }

    if (!targetUserId) return res.status(404).json({ error: 'User not found', email: userEmail });

    const { data: existing } = await supabase
      .from('user_progress')
      .select('credits')
      .eq('user_id', targetUserId)
      .single();

    const currentCredits = existing?.credits || 0;
    const newCredits = currentCredits + creditsToAdd;

    const { error: upsertError } = await supabase
      .from('user_progress')
      .upsert({
        user_id: targetUserId,
        credits: newCredits,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) return res.status(500).json({ error: 'Upsert failed: ' + upsertError.message });

    return res.status(200).json({ success: true, credits: newCredits, userId: targetUserId });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
