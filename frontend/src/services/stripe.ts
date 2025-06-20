import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export const createPaymentMethod = async (stripe: Stripe, cardElement: Element) => {
  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: 'card',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    card: cardElement as any, 
  });

  if (error) {
    throw new Error(error.message);
  }

  return paymentMethod;
};

export const confirmPayment = async (
  stripe: Stripe, 
  clientSecret: string, 
  paymentMethodId: string
) => {
  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: paymentMethodId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return paymentIntent;
};

export default {
  getStripe,
  createPaymentMethod,
  confirmPayment,
};
