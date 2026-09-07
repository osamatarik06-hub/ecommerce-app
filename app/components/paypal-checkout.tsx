'use client';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function PayPalCheckout() {
  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}>
      <PayPalButtons 
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: "USD",
                value: "49.99"
              }
            }]
          });
        }}
        onApprove={async (data, actions) => {
          const details = await actions.order?.capture();
          alert(`Transaction completed by ${details?.payer?.name?.given_name}`);
        }}
      />
    </PayPalScriptProvider>
  );
}