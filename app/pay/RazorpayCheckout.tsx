import React from "react";
import { Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

interface RazorpayCheckoutProps {
  orderId: string;
  visible: boolean;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onCancel: () => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

// Razorpay Checkout HTML template
const RazorpayHTML = (
  orderId: string,
  prefill?: { name?: string; email?: string; contact?: string }
) => `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body>
        <script>
          const prefill = ${JSON.stringify(prefill || {})};
          var options = {
            key: "rzp_test_RjxJM60aK3x9Nn", // Replace with your actual key
            order_id: "${orderId}",
            name: "FoodFarming.in",
            description: "Paid Call Service",
            handler: function (response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ event: "success", payload: response }));
            },
            modal: { ondismiss: function () { window.ReactNativeWebView.postMessage(JSON.stringify({ event: "cancel" })); } },
            prefill: prefill
          };
          var rzp = new Razorpay(options);
          rzp.open();
        </script>
      </body>
    </html>
  `;

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  orderId,
  visible,
  onSuccess,
  onCancel,
  prefill,
}) => {
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ flex: 1 }}>
        <WebView
          originWhitelist={["*"]}
          source={{ html: RazorpayHTML(orderId, prefill) }}
          onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.event === "success") {
              const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = data.payload;
              onSuccess(razorpay_payment_id, razorpay_order_id, razorpay_signature);
            }

            if (data.event === "cancel") {
              onCancel();
            }
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default RazorpayCheckout;