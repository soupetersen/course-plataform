import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "../../services/stripe";
import { PaymentModal } from "./PaymentModal";
import type { Course } from "../../types/api";

interface StripePaymentWrapperProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paymentType?: "ONE_TIME" | "SUBSCRIPTION";
}

export const StripePaymentWrapper: React.FC<StripePaymentWrapperProps> = (
  props
) => {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      <PaymentModal {...props} />
    </Elements>
  );
};
