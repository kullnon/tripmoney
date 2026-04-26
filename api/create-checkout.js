import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  monthly: 'price_1TQIvWJVPirYifUyW0euPVoZ',
  annual: 'price_1TQIzFJVPirYifUyCo89b8NJ',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, userId, email } = req.body;

    if (!plan || !PRICES[plan]) {
      return res.status(400).json({ error: 'Invalid plan.' });
    }

    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing userId or email.' });
    }

    const origin = req.headers.origin || 'https://mytripmoney.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: PRICES[plan], quantity: 1 }],
      metadata: { supabase_user_id: userId },
      success_url: origin + '?checkout=success',
      cancel_url: origin + '?checkout=cancel',
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
}
