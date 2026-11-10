# CartPilot

**Less noise. Better choices.** CartPilot helps people compare live product listings against their budget and priorities. Gemini turns a plain-language brief into weighted shopping priorities; CartPilot scores listing data locally, and the shopper stays in control through PayPal Sandbox.

> This is a hackathon prototype. It uses PayPal Sandbox only. It does not place real orders with retailers or guarantee listing availability.

## What it does

- Turns a shopping brief into visible, weighted priorities and enforces an explicit budget.
- Searches live products through Channel3 across categories such as headphones, shoes, bags, laptops, coffee, travel mugs, and portable chargers.
- Scores listing details locally against the Gemini-created priority profile, with category-aware local fallback priorities when Gemini is unavailable.
- Shows the matching rationale, a listing-based “Good to know” trade-off, price, retailer, and listing link when those fields are returned.
- Creates and captures a PayPal Sandbox order only after the shopper selects a live result and approves PayPal checkout.
- Includes a labeled, multi-category sample catalog so the experience can be explored before API credentials are added. Sample listings cannot be checked out.

## Stack

- React, TypeScript, Vite
- Node.js, Express, Zod
- Gemini Developer API via the official `@google/genai` SDK
- Channel3 Product Search API (`POST /v1/search`)
- PayPal Orders v2 API and PayPal JavaScript SDK

## Run locally

Requirements: Node.js 22+, npm, and (for live integrations) API credentials listed below.

```bash
npm install
Copy-Item .env.example .env
# Fill in the values in .env, then:
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite development server proxies `/api` calls to the Express server on port 8787.

### Production run

```powershell
npm run build
$env:NODE_ENV="production"
npm start
```

The Express server serves the compiled client and API from one origin. Configure your host with `npm run build` as its build command and `npm start` as its start command, and set the same secrets in the host's environment settings.

### Deploy to Vercel

The project includes a Vercel Function entry point at [`api/[...path].ts`](api/[...path].ts), which routes `/api/*` requests through the Express app. Vercel serves the Vite build as static assets. Import the Git repository into Vercel and use the detected Vite build settings. Add `GEMINI_API_KEY`, `CHANNEL3_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and optionally `GEMINI_MODEL` in the Vercel project's Environment Variables. Keep PayPal set to Sandbox; this demo does not charge real money.

Before sharing the URL, check `/api/config`, run searches from multiple categories, and complete a PayPal Sandbox buyer approval. Keep the demo available and unrestricted for judges during the judging period.

### Alternative: Deploy to Render

The included [`render.yaml`](render.yaml) is a Render Blueprint for the web service. Push this project to a GitHub repository, choose **New → Blueprint** in Render, connect that repository, and enter the four secret values when Render prompts for them. The app remains pinned to PayPal Sandbox; the hosted demo will not charge real money.

### Environment variables

| Variable               | Required for                                     | Where to get it                                                                                   |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `PAYPAL_CLIENT_ID`     | PayPal checkout                                  | PayPal Developer Dashboard → Apps & Credentials → Sandbox                                         |
| `PAYPAL_CLIENT_SECRET` | Server-side PayPal Orders API                    | Same Sandbox app; never expose this in client code                                                |
| `CHANNEL3_API_KEY`     | Live product search and checkout eligibility     | [Channel3 developer portal](https://trychannel3.com/developers); use the hackathon key/promo flow |
| `GEMINI_API_KEY`       | AI interpretation of shopper priorities          | [Google AI Studio API keys](https://aistudio.google.com/api-keys)                                 |
| `GEMINI_MODEL`         | Gemini model (default: `gemini-3.5-flash-lite`)  | Optional; falls back to other configured Flash-Lite models when unavailable                       |
| `PORT`                 | Express server port (default `8787`)             | Optional                                                                                          |
| `CLIENT_ORIGIN`        | Reserved for deployment configuration            | Optional                                                                                          |

All credentials belong in `.env`, which is ignored by Git. **Never commit API keys.** Gemini receives only the shopper's brief and returns weighted priority keys. Channel3 product records are never included in Gemini prompts; the server matches listing text against those priorities locally. If Gemini is absent or unavailable, local keyword priorities are used and the UI says so. Google currently lists free input/output for Gemini 3.5 Flash-Lite and Gemini 3.1 Flash-Lite, subject to access and quotas; the free tier may use prompts to improve Google products. Review [current pricing and data terms](https://ai.google.dev/gemini-api/docs/pricing) and avoid entering sensitive personal information. Channel3 results are retained only briefly for checkout eligibility and are never sent to Gemini or used to improve a model. If `CHANNEL3_API_KEY` is absent, CartPilot uses clearly labeled sample data and disables checkout for those sample listings.

### Gemini API key setup

1. Sign in to [Google AI Studio](https://aistudio.google.com/).
2. Open [API keys](https://aistudio.google.com/api-keys) and create an API key for a project.
3. Copy the key into `.env` as `GEMINI_API_KEY`. Keep it on the server; do not put it in React code or commit it.
4. Leave `GEMINI_MODEL=gemini-3.5-flash-lite` to use the tested free-tier Flash-Lite model, or select a model available on your project's free tier. CartPilot tries `gemini-3.1-flash-lite` if the selected model is unavailable.
5. Restart `npm run dev`. A successful Gemini call shows **AI PROFILE ACTIVE** and relative priority weights; the model receives only the brief and never receives product-catalog records.

Free access has model-specific quotas and can change. See [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) for current model and quota details.

### PayPal Sandbox setup

1. Create a Sandbox app in the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox).
2. Put that app's client ID and secret into `.env`.
3. Use a PayPal Sandbox personal test account to approve the checkout.
4. The server is intentionally pinned to PayPal's Sandbox API host.

### Channel3 setup

1. Sign up at [Channel3 for Developers](https://trychannel3.com/developers).
2. Claim a hackathon key using promo code `PAYPAL-HACKATHON-2026`. The sponsor page currently offers 20,000 search credits with no credit card required.
3. Add the key to `.env` as `CHANNEL3_API_KEY` and restart the app.

A displayed live Channel3 result includes a server-signed checkout token that expires after 15 minutes. The order endpoint verifies the signature and uses the signed listing price, so checkout works across serverless function instances without trusting a browser-supplied amount. A short-lived in-memory cache remains as a local fallback.

CartPilot uses Channel3's publisher API for product search and displays the returned records in the app. It does not send Channel3 records to Gemini or use them to train or fine-tune a model. Review [Channel3 Publisher Terms](https://connect.trychannel3.com/terms/publishers) before operating the app outside the hackathon demo.

### PayPal Sandbox credentials

1. Sign in or create a developer account at the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
2. Open **Apps & Credentials**, select **Sandbox**, and create an app.
3. Copy its **Client ID** into `PAYPAL_CLIENT_ID` and its **Secret** into `PAYPAL_CLIENT_SECRET` in `.env`. Keep the secret private.
4. In **Testing Tools → Sandbox Accounts**, use the personal test account as the buyer. The Sandbox business account is the seller.
5. Restart the app and complete checkout with the personal Sandbox account. No real money moves.

## Project structure

```text
server/index.ts              Express routes, AI calls, Channel3 adapter, PayPal Orders API
src/App.tsx                  Shopping experience and checkout review dialog
src/components/ProductCard.tsx
src/components/PayPalButton.tsx
src/styles.css               Responsive visual system and motion
docs/DEVPOST_COPY.md         Draft project description and tool disclosures
docs/DEMO_SCRIPT.md          Under-three-minute recording outline
docs/SUBMISSION_CHECKLIST.md Rules, ownership, and submission handoff
```

## API routes

- `GET /api/config` — public integration readiness flags and PayPal client ID for the JS SDK.
- `POST /api/search` — interprets shopper priorities with Gemini, searches Channel3 or uses a category-matched sample catalog, and scores listings locally against the profile and budget.
- `POST /api/orders` — creates a Sandbox order from a server-retained live listing; client-supplied price is not accepted.
- `POST /api/orders/:orderId/capture` — captures a buyer-approved Sandbox order.

## Trust and limitations

- CartPilot does not buy anything before the user approves through PayPal.
- Search and AI output are recommendations, not verified endorsements. Product text and listing data are treated as untrusted content.
- Gemini receives only the shopper's brief. A deterministic server-side matcher scores Channel3 listing text against the returned priority weights; unusual product wording may not be recognized.
- The prototype does not fulfill retailer orders. PayPal checkout is a Sandbox demonstration of a payment flow to the hackathon developer's Sandbox merchant account.
- Live API availability, catalog data, and pricing depend on the connected providers.
- PayPal credentials, Channel3, and Gemini keys are server-side. The public config endpoint exposes only the PayPal client ID needed to render the SDK and readiness flags.

## Build

```bash
npm run build
```

## Hackathon submission prep

See the [Devpost copy draft](docs/DEVPOST_COPY.md), [demo script](docs/DEMO_SCRIPT.md), and [submission checklist](docs/SUBMISSION_CHECKLIST.md). Before submission, publish this repository publicly, confirm the MIT license appears in the repository About area, configure a hosted demo or provide complete run instructions, record and upload the working demo to YouTube, and submit the links on Devpost before the posted deadline.

## License

MIT. See [LICENSE](LICENSE).
