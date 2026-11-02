import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// The buyer is the logged-in Supabase user, read from the access token. Until
// 2026-11-02 userId and email came from the request body with no login, so a
// paid session could carry any userId and webhook.js would upgrade that profile.
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://rthpayyevlloxsbzfxuf.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function sessionUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id || !data.user.email) return null;
  return data.user;
}

const PRICES = {
  monthly: 'price_1TQIvWJVPirYifUyW0euPVoZ',
  annual: 'price_1TQIzFJVPirYifUyCo89b8NJ',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await sessionUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Please log in to start checkout.' });
    }
    const userId = user.id;
    const email = user.email;

    // Any userId/email in the body is ignored.
    const { plan } = req.body || {};
    if (!plan || !PRICES[plan]) {
      return res.status(400).json({ error: 'Invalid plan.' });
    }

    const origin = req.headers.origin || 'https://www.mytripmoney.com';

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