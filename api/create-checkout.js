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
    console.error('Stripe checkout error:', {
      type: err.type,
      code: err.code,
      message: err.message,
      requestId: err.requestId,
    });

    if (err.type === 'StripeAuthenticationError') {
      return res.status(503).json({
        error: 'Payment service temporarily unavailable. Please try again in a moment.',
      });
    }
    if (err.type === 'StripeCardError') {
      return res.status(400).json({
        error: 'Payment could not be processed. Please check your card details.',
      });
    }
    if (err.type === 'StripeRateLimitError') {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment and try again.',
      });
    }
    if (err.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'Unable to start checkout. Please try again or contact support.',
      });
    }

    return res.status(500).json({
      error: 'Something went wrong. Please try again, or contact support if this continues.',
    });
  }
}