import { paymentAPI } from "../api";
import { loadStripe } from "@stripe/stripe-js";

// Keep ONE promise, not just ONE resolved instance.
// This prevents multiple loadStripe() calls when React/effects
// execute at nearly the same time.
let stripePromise = null;

const getStripe = async () => {
  if (stripePromise) {
    return stripePromise;
  }

  stripePromise = (async () => {
    const { data } = await paymentAPI.getConfig();

    if (!data?.publishableKey) {
      throw new Error("Stripe publishable key not configured on server.");
    }

    const stripe = await loadStripe(data.publishableKey);

    if (!stripe) {
      throw new Error("Stripe failed to initialize.");
    }

    return stripe;
  })();

  return stripePromise;
};


/**
 * Create and mount a Card Element.
 *
 * IMPORTANT:
 * The returned `stripe` MUST be used with the returned
 * `cardElement`.
 */
export const mountCardElement = async (domNode, onChange) => {
  if (!domNode) {
    throw new Error("Stripe card mount element not found.");
  }

  const stripe = await getStripe();

  const elements = stripe.elements();

  const cardElement = elements.create("card", {
    hidePostalCode: true,
    style: {
      base: {
        fontSize: "16px",
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        color: "#0B1915",
        "::placeholder": {
          color: "rgba(11,25,21,0.35)",
        },
      },
      invalid: {
        color: "#C0392B",
      },
    },
  });

  cardElement.mount(domNode);

  if (onChange) {
    cardElement.on("change", onChange);
  }

  return {
    stripe,
    elements,
    cardElement,
  };
};


/**
 * Reservation advance payment
 */
export const payReservationAdvance = async ({
  paymentMethod,
  stripe,
  cardElement,
  upiVpa,
}) => {
  // -----------------------------
  // UPI
  // -----------------------------
  if (paymentMethod === "UPI") {
    if (!upiVpa) {
      throw new Error("Please enter a valid UPI ID.");
    }

    const { data } = await paymentAPI.completeAdvanceDirect({
      paymentMethod: "UPI",
      upiVpa,
    });

    return {
      paymentIntentId: data.paymentIntentId,
      redirected: false,
    };
  }


  // -----------------------------
  // CARD
  // -----------------------------
  if (!stripe) {
    throw new Error("Stripe is not initialized.");
  }

  if (!cardElement) {
    throw new Error("Card element not mounted.");
  }

  const { data } = await paymentAPI.createAdvanceIntent({
    paymentMethod,
  });

  const { clientSecret } = data;

  if (!clientSecret) {
    throw new Error(
      "Backend did not return clientSecret. Check createAdvanceIntent API."
    );
  }

  // IMPORTANT:
  // Use the EXACT stripe instance that created cardElement.
  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
    },
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return {
    paymentIntentId: result.paymentIntent?.id,
    redirected: false,
  };
};


/**
 * Confirm Stripe payment for bill settlement.
 */
const confirmStripePayment = async ({
  paymentMethod,
  stripe,
  clientSecret,
  cardElement,
  upiVpa,
}) => {
  if (paymentMethod === "Card") {
    if (!stripe) {
      throw new Error("Stripe is not initialized.");
    }

    if (!cardElement) {
      throw new Error("Please enter your card details.");
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (result.error) {
      throw new Error(
        result.error.message || "Card payment failed."
      );
    }

    const paymentIntent = result.paymentIntent;

    if (paymentIntent?.status === "requires_action") {
      const redirectUrl =
        paymentIntent.next_action?.redirect_to_url?.url;

      return {
        requiresAction: true,
        redirectUrl,
        paymentIntentId: paymentIntent.id,
      };
    }

    return {
      paymentIntentId: paymentIntent.id,
      requiresAction: false,
    };
  }


  if (paymentMethod === "UPI") {
    if (!upiVpa) {
      throw new Error("Please enter a valid UPI ID.");
    }

    return {
      paymentIntentId: null,
      requiresAction: false,
      upiCompleted: true,
    };
  }

  throw new Error("Invalid payment method.");
};


/**
 * Pay Bill
 */
export const payBill = async ({
  paymentMethod,
  stripe,
  cardElement,
  upiVpa,
  cashAmount,
  reservationId,
  subtotal,
  tax,
  orderIds,
  tableLabel,
}) => {

  // -----------------------------
  // CASH
  // -----------------------------
  if (paymentMethod === "Cash") {
    if (!cashAmount || Number(cashAmount) <= 0) {
      throw new Error("Please enter a valid cash amount.");
    }

    const completeRes = await paymentAPI.completeBill({
      reservationId,
      orderIds,
      paymentMethod: "Cash",
      subtotal,
      tax,
      tableLabel,
    });

    return completeRes.data;
  }

  // -----------------------------
  // UPI
  // -----------------------------
  if (paymentMethod === "UPI") {
    if (!upiVpa) {
      throw new Error("Please enter a valid UPI ID.");
    }

    const completeRes = await paymentAPI.completeBill({
      reservationId,
      orderIds,
      paymentMethod: "UPI",
      subtotal,
      tax,
      tableLabel,
    });

    return completeRes.data;
  }


  // -----------------------------
  // CREATE PAYMENT INTENT
  // -----------------------------
  const intentRes = await paymentAPI.createBillIntent({
    reservationId,
    subtotal,
    tax,
    paymentMethod,
  });

  if (intentRes.data.noPaymentRequired) {
    const completeRes = await paymentAPI.completeBill({
      reservationId,
      orderIds,
      subtotal,
      tax,
      tableLabel,
    });

    return completeRes.data;
  }

  const {
    clientSecret,
    paymentIntentId,
  } = intentRes.data;


  // -----------------------------
  // CONFIRM PAYMENT
  // -----------------------------
  const stripeForConfirm =
    stripe || (paymentMethod === "Card" ? await getStripe() : null);

  const result = await confirmStripePayment({
    paymentMethod,
    stripe: stripeForConfirm,
    clientSecret,
    cardElement,
    upiVpa,
  });


  if (result.requiresAction && result.redirectUrl) {
    window.location.href = result.redirectUrl;

    return {
      redirected: true,
    };
  }


  // -----------------------------
  // COMPLETE BILL
  // -----------------------------
  const completeRes = await paymentAPI.completeBill({
    reservationId,
    orderIds,
    paymentIntentId:
      result.paymentIntentId || paymentIntentId,
    subtotal,
    tax,
    tableLabel,
  });

  return completeRes.data;
};