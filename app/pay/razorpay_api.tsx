export const createRazorpayOrder = async (amountInRupees: number) => {
  try {
    const response = await fetch(
      "https://dev-backend-py-23809827867.us-east1.run.app/razorpay/create-order/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount_rupees_paisa: Math.round(amountInRupees * 100),
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create order: ${response.status} ${errorText}`);
    }

    const order = await response.json();

    if (order.order_id) {
      return order.order_id;
    } else {
      throw new Error("Order ID not returned from server: " + JSON.stringify(order));
    }
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    throw err; // Re-throw the error to be handled by the caller
  }
};
