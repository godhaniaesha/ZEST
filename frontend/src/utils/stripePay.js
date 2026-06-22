import { paymentAPI } from "../api";
import { loadStripe } from "@stripe/stripe-js";

let stripeInstance = null;
let publishableKeyCache = null;
let elementsInstance = null;

const loadStripeScript = () =>
  new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve(window.Stripe);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://js.stripe.com/v3/"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Stripe));
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Stripe.js")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.async = true;
    script.onload = () => resolve(window.Stripe);
    script.onerror = () => reject(new Error("Failed to load Stripe.js"));
    document.head.appendChild(script);
  });

export const getStripePublishableKey = async () => {
  if (publishableKeyCache) return publishableKeyCache;

  const { data } = await paymentAPI.getConfig();
  console.log("Stripe Config Response:", data);
  console.log("Publishable Key:", data.publishableKey);
  if (!data?.publishableKey) {
    throw new Error(
      data?.message ||
      "Stripe publishable key is missing. Add STRIPE_PUBLISHABLE_KEY to backend .env",
    );
  }

  publishableKeyCache = data.publishableKey;
  return publishableKeyCache;
};

const getStripe = async () => {
  if (!stripeInstance) {
    const { data } = await paymentAPI.getConfig();

    if (!data.publishableKey) {
      throw new Error("Stripe publishable key not configured on server.");
    }

    stripeInstance = await loadStripe(data.publishableKey);
  }

  return stripeInstance;
};

export const mountCardElement = async (domNode, onChange) => {
  const stripe = await getStripe();
  if (!elementsInstance) {
    elementsInstance = stripe.elements();
  }

  const cardElement = elementsInstance.create("card", {
    style: {
      base: {
        fontSize: "16px",
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        color: "#0B1915",
        "::placeholder": { color: "rgba(11,25,21,0.35)" },
      },
      invalid: { color: "#C0392B" },
    },
  });

  cardElement.mount(domNode);
  cardElement.on("change", onChange);

  return { stripe, cardElement };
};

export const payReservationAdvance = async ({
  paymentMethod,
  cardElement,
  upiVpa,
}) => {
  // For UPI, handle differently - skip Stripe and complete directly
  if (paymentMethod === "UPI") {
    if (!upiVpa) {
      throw new Error("Please enter a valid UPI ID.");
    }
    // Create payment record directly for UPI
    const { data } = await paymentAPI.completeAdvanceDirect({
      paymentMethod: "UPI",
      upiVpa,
    });
    return {
      paymentIntentId: data.paymentIntentId,
      redirected: false,
    };
  }

  const stripe = await getStripe();

  const { data } = await paymentAPI.createAdvanceIntent({
    paymentMethod,
  });

  console.log("FULL RESPONSE:", data);
  console.log("CLIENT SECRET:", data.clientSecret);
  console.log("PAYMENT INTENT ID:", data.paymentIntentId);

  const { clientSecret } = data;

  if (!clientSecret) {
    throw new Error(
      "Backend did not return clientSecret. Check createAdvanceIntent API."
    );
  }

  // Handle Card payment
  if (!cardElement) {
    throw new Error("Card element not mounted.");
  }

  const result = await stripe.confirmCardPayment(
    clientSecret,
    {
      payment_method: {
        card: cardElement,
      },
    }
  );

  console.log("Stripe Result:", result);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return {
    paymentIntentId: result.paymentIntent?.id,
    redirected: false,
  };
};

const confirmStripePayment = async ({
  paymentMethod,
  clientSecret,
  cardElement,
  upiVpa,
}) => {
  const stripe = await getStripe();

  if (paymentMethod === "Card") {
    if (!cardElement) {
      throw new Error("Please enter your card details.");
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (result.error) {
      throw new Error(result.error.message || "Card payment failed.");
    }

    const paymentIntent = result.paymentIntent;

    if (paymentIntent && paymentIntent.status === "requires_action") {
      const redirectUrl = paymentIntent.next_action?.redirect_to_url?.url;
      return { requiresAction: true, redirectUrl, paymentIntentId: paymentIntent.id };
    }

    return { paymentIntentId: paymentIntent.id, requiresAction: false };
  }

  // For POS UPI payments, we'll handle it differently
  // Since this is an admin POS system, UPI payments are typically completed
  // by the customer directly to the merchant's UPI ID
  // We'll mark it as completed without Stripe confirmation
  if (paymentMethod === "UPI") {
    if (!upiVpa) {
      throw new Error("Please enter a valid UPI ID.");
    }
    // Return success without Stripe confirmation for POS UPI
    // The backend will handle marking the payment as completed
    return { paymentIntentId: null, requiresAction: false, upiCompleted: true };
  }

  throw new Error("Invalid payment method.");
};

export const payBill = async ({
  paymentMethod,
  cardElement,
  upiVpa,
  reservationId,
  subtotal,
  tax,
  orderIds,
}) => {
  // For UPI, skip Stripe payment intent creation and complete directly
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
    });
    return completeRes.data;
  }

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
    });
    return completeRes.data;
  }

  const { clientSecret, paymentIntentId } = intentRes.data;

  const result = await confirmStripePayment({
    paymentMethod,
    clientSecret,
    cardElement,
    upiVpa,
  });

  if (result.requiresAction && result.redirectUrl) {
    window.location.href = result.redirectUrl;
    return { redirected: true };
  }

  const completeRes = await paymentAPI.completeBill({
    reservationId,
    orderIds,
    paymentIntentId: result.paymentIntentId || paymentIntentId,
    subtotal,
    tax,
  });

  return completeRes.data;
};
