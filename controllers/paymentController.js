// Initialize Stripe only if secret key is provided and not empty
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim() !== '') {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (error) {
    console.warn('Stripe initialization failed:', error.message);
  }
}
const supabase = require('../config/supabase');

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(503).json({ error: 'Payment system not configured' });
    }

    const { amount, project_id, reward_id } = req.body;
    const user_id = req.user.id;

    // Validate amount
    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        user_id,
        project_id,
        reward_id: reward_id || 'none',
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

// Handle webhook for payment confirmation
exports.webhook = async (req, res) => {
  // Check if Stripe is configured
  if (!stripe) {
    return res.status(503).json({ error: 'Payment system not configured' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    try {
      // Create contribution record
      const { user_id, project_id, reward_id } = paymentIntent.metadata;
      
      const { data: contribution, error } = await supabase
        .from('contributions')
        .insert({
          user_id,
          project_id,
          reward_id: reward_id !== 'none' ? reward_id : null,
          amount: paymentIntent.amount / 100, // Convert from cents
          payment_method: 'stripe',
        })
        .select()
        .single();

      if (error) throw error;

      // Update project current_amount
      await supabase.rpc('increment_project_amount', {
        project_id,
        amount: paymentIntent.amount / 100,
      });

      // Update reward backers if applicable
      if (reward_id && reward_id !== 'none') {
        await supabase.rpc('increment_reward_backers', {
          reward_id,
        });
      }

      console.log('Contribution recorded:', contribution);
    } catch (error) {
      console.error('Error recording contribution:', error);
    }
  }

  res.json({ received: true });
};

// Get Stripe publishable key
exports.getPublishableKey = (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' });
};
