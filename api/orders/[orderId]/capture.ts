import type { Request, Response } from "express";
import app from "../../../server/app.js";

type CaptureRequest = Request & {
  query: Request["query"] & { orderId?: string | string[] };
};

export default function captureOrder(req: CaptureRequest, res: Response) {
  const value = req.query.orderId;
  const orderId = Array.isArray(value) ? value[0] : value;
  if (!orderId) {
    return res.status(400).json({ error: "Invalid PayPal order." });
  }

  const incomingUrl = req.url || "";
  const query = incomingUrl.includes("?") ? incomingUrl.slice(incomingUrl.indexOf("?")) : "";
  req.url = `/api/orders/${encodeURIComponent(orderId)}/capture${query}`;
  return app(req, res);
}

