import { useEffect, useRef, useState } from "react";
import type { Product } from "../types";

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: Record<string, unknown>) => {
        render: (element: HTMLElement) => Promise<void>;
        close?: () => void;
      };
    };
  }
}

type Props = {
  clientId: string;
  product: Product;
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
};

async function readApiResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(
      `CartPilot checkout returned an unexpected response (HTTP ${response.status}). Please try again and share this status if it continues.`,
    );
  }
}

export default function PayPalButton({
  clientId,
  product,
  onSuccess,
  onError,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!clientId || !container.current) return;
    let cancelled = false;
    let button:
      ReturnType<NonNullable<typeof window.paypal>["Buttons"]> | undefined;
    const render = async () => {
      const existing = document.querySelector<HTMLScriptElement>("#paypal-sdk");
      if (!window.paypal && !existing) {
        const script = document.createElement("script");
        script.id = "paypal-sdk";
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(product.currency)}&intent=capture&components=buttons`;
        script.async = true;
        document.body.appendChild(script);
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("PayPal checkout could not load."));
        });
      } else if (!window.paypal && existing) {
        await new Promise<void>((resolve, reject) => {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener(
            "error",
            () => reject(new Error("PayPal checkout could not load.")),
            { once: true },
          );
        });
      }
      if (cancelled || !container.current || !window.paypal) return;
      button = window.paypal.Buttons({
        style: {
          layout: "vertical",
          shape: "rect",
          label: "paypal",
          height: 46,
        },
        createOrder: async () => {
          const response = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: product.id,
              ...(product.checkoutToken ? { checkoutToken: product.checkoutToken } : {}),
            }),
          });
          const body = await readApiResponse(response);
          if (!response.ok || !body.id)
            throw new Error(typeof body.error === "string" ? body.error : "Unable to start checkout.");
          return body.id as string;
        },
        onApprove: async (data: { orderID: string }) => {
          const response = await fetch(
            `/api/orders/${encodeURIComponent(data.orderID)}/capture`,
            { method: "POST" },
          );
          const body = await readApiResponse(response);
          if (!response.ok || body.status !== "COMPLETED")
            throw new Error(
              typeof body.error === "string" ? body.error : "PayPal did not confirm this payment.",
            );
          onSuccess(data.orderID);
        },
        onCancel: () =>
          onError("Checkout was cancelled. No payment was captured."),
        onError: (error: Error) =>
          onError(error.message || "PayPal checkout could not be completed."),
      });
      await button.render(container.current);
      if (!cancelled) setReady(true);
    };
    render().catch((error: Error) => onError(error.message));
    return () => {
      cancelled = true;
      button?.close?.();
    };
  }, [clientId, product, onError, onSuccess]);

  return (
    <div className="paypal-wrap">
      <div ref={container} aria-label="PayPal sandbox checkout" />
      {!ready && (
        <div className="paypal-loading">Loading secure PayPal checkout…</div>
      )}
    </div>
  );
}

