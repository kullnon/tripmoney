import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Use Supabase service role key (bypasses RLS) to update profiles
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://ctysqawmqjgyutpofetu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Vercel needs raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read raw body from request
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let event;

  try {
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];

    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.supabase_user_id;
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    if (userId) {
      try {
        // Update the user's profile to Pro
        const { error } = await supabase
          .from('profiles')
          .update({
            plan: 'pro',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('Supabase update error:', error);
        } else {
          console.log(`User ${userId} upgraded to Pro!`);
        }
      } catch (err) {
        console.error('Failed to update profile:', err);
      }
    }
  }

  // Handle subscription cancellation
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    try {
      // Find user by stripe_customer_id and downgrade
      const { error } = await supabase
        .from('profiles')
        .update({
          plan: 'free',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('Supabase downgrade error:', error);
      } else {
        console.log(`Customer ${customerId} downgraded to Free.`);
      }
    } catch (err) {
      console.error('Failed to downgrade profile:', err);
    }
  }

  return res.status(200).json({ received: true });
}
