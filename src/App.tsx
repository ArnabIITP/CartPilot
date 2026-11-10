import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  LoaderCircle,
  LockKeyhole,
  ListFilter,
  PackageCheck,
  Scale,
  Search,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import ProductCard from "./components/ProductCard";
import PayPalButton from "./components/PayPalButton";
import type { AppConfig, Product, SearchResult } from "./types";

const suggestionPool = [
  "Over-ear headphones for a noisy train commute under $150; comfort first",
  "Noise-cancelling earbuds for a crowded commute under $100",
  "Long-battery headphones for daily train travel under $200",
  "Lightweight wireless headphones for walking under $120",
  "Headphones with a clear microphone for work calls under $180",
  "Comfortable wired over-ear headphones under $60",
  "A water-resistant backpack with a padded laptop sleeve under $100",
  "A lightweight daypack for weekend hikes with room for a water bottle",
  "Cushioned walking shoes with good grip for rainy city streets under $120",
  "Running shoes for long distances with extra cushioning under $140",
  "A lightweight laptop for college with long battery life under $900",
  "A laptop for photo editing with a bright screen and at least 16GB RAM",
  "A 20,000mAh power bank with fast USB-C charging under $50",
  "An insulated travel mug that stays hot and does not leak under $35",
  "Medium-roast whole bean coffee with chocolate notes under $25",
  "A compact espresso grinder that is easy to clean under $100",
  "A durable carry-on backpack that fits under an airplane seat",
  "Wireless earbuds with a secure fit and clear calls for the gym",
];

function chooseSuggestions(count: number) {
  const pool = [...suggestionPool];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool.slice(0, count);
}

function BrandMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="brand-route"
    >
      <path
        d="M5.5 18.5 10 13l4 2.5L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="5.5" cy="18.5" r="2" fill="currentColor" />
      <circle cx="19" cy="7" r="2" fill="currentColor" />
    </svg>
  );
}

export default function App() {
  const [suggestions] = useState(() => chooseSuggestions(6));
  const [query, setQuery] = useState(suggestions[0]);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<AppConfig>({
    paypalClientId: "",
    paypalEnvironment: "sandbox",
    channel3Ready: false,
    aiReady: false,
  });
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((response) => response.json())
      .then(setConfig)
      .catch(() => undefined);
  }, []);

  const selected = useMemo(
    () => result?.products.find((product) => product.id === selectedId) ?? null,
    [result, selectedId],
  );

  const search = useCallback(
    async (value = query) => {
      if (value.trim().length < 3) {
        setError("Tell us a little more about what you’re looking for.");
        return;
      }
      setLoading(true);
      setError("");
      setPaymentMessage("");
      setPaymentSuccess(false);
      setCheckoutOpen(false);
      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: value.trim() }),
        });
        const body = await response.json();
        if (!response.ok)
          throw new Error(
            body.error || "We couldn’t search just now. Please try again.",
          );
        setResult(body as SearchResult);
        setSelectedId(body.products?.[0]?.id || "");
      } catch (searchError) {
        setError(
          searchError instanceof Error
            ? searchError.message
            : "Search didn’t work. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  const handleSuccess = useCallback((orderId: string) => {
    setPaymentSuccess(true);
    setPaymentMessage(`Payment confirmed · Order ${orderId}`);
  }, []);
  const handlePaymentError = useCallback(
    (message: string) => setPaymentMessage(message),
    [],
  );

  const money = (product: Product) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: product.currency || "USD",
    }).format(product.price);
  const preferences = Array.isArray(result?.brief.preferences)
    ? result.brief.preferences
    : result?.brief.preferences
      ? [result.brief.preferences]
      : [];

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="CartPilot home">
          <span className="brand-mark">
            <BrandMark />
          </span>
          <span>
            cartpilot<span className="brand-period">.</span>
          </span>
        </a>
        <nav className="top-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#about">Our promise</a>
        </nav>
        <div className="top-actions">
          <span className="sandbox-pill">
            <span /> SANDBOX MODE
          </span>
          <a
            className="help-button"
            href="#how-it-works"
            title="How CartPilot works"
            aria-label="How CartPilot works"
          >
            <CircleHelp size={18} />
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" /> BUILT FOR EVERYDAY SHOPPING
            </div>
            <h1>
              Less noise.
              <br />
              <em>Better choices.</em>
            </h1>
            <p className="hero-subtitle">
              Compare live product listings against the details that matter,
              from fit and battery life to capacity and durability. You choose
              what fits.
            </p>
            <div className="trust-row">
              <span>
                <ShieldCheck size={15} /> You approve every purchase
              </span>
              <span className="trust-separator">·</span>
              <span>PayPal Sandbox checkout</span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-sticker">
              <ShoppingBag size={18} />
              <span>
                Thoughtful
                <br />
                shopping
              </span>
            </div>
            <div className="art-card art-card-back">
              <div className="art-card-image art-image-back" />
              <span>Worth the search</span>
              <div className="art-mini-lines">
                <i />
                <i />
              </div>
            </div>
            <div className="art-card art-card-front">
              <div className="art-card-image art-image-front" />
              <span>Just your kind of find</span>
              <div className="art-mini-lines">
                <i />
                <i />
              </div>
            </div>
          </div>
        </section>

        <section className="search-panel" aria-label="Describe what you need">
          <div className="search-panel-head">
            <div className="search-icon">
              <WandSparkles size={19} />
            </div>
            <div>
              <strong>What are you shopping for?</strong>
              <span>Tell us your budget and the details that matter.</span>
            </div>
            <span className="step-label">
              STEP 01 <ArrowDown size={13} />
            </span>
          </div>
          <form
            className="search-form"
            onSubmit={(event) => {
              event.preventDefault();
              void search();
            }}
          >
            <label className="sr-only" htmlFor="shopping-query">
              Describe what matters for your purchase
            </label>
            <textarea
              id="shopping-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter")
                  void search();
              }}
              placeholder="e.g. A lightweight backpack with a laptop sleeve under $100…"
              rows={2}
            />
            <button className="search-button" type="submit" disabled={loading}>
              {loading ? (
                <LoaderCircle size={17} className="spin" />
              ) : (
                <Search size={17} />
              )}
              <span>{loading ? "Finding your picks" : "Find my picks"}</span>
              <ArrowRight size={16} />
            </button>
          </form>
          <div className="suggestion-row">
            <span>TRY</span>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion);
                  void search(suggestion);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <p className="privacy-note">
            Your brief is sent to Google Gemini and Channel3 to run this search.
            Google’s free tier may use prompts to improve its products. Don’t
            include names or sensitive details.
          </p>
          {error && (
            <div className="inline-error" role="alert">
              {error}
            </div>
          )}
        </section>

        <section className="results-section" aria-live="polite">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> YOUR SHORTLIST
              </div>
              <h2>
                {result
                  ? "A few good possibilities."
                  : "A little less scrolling."}
              </h2>
            </div>
            <div className="results-meta">
              {result ? (
                <>
                  <span className="result-count">
                    {result.products.length} PICKS
                  </span>
                  <span className="meta-divider" />
                  {result.source === "channel3" ? (
                    <span className="source-label">
                      <span className="live-dot" /> LIVE PRODUCT SEARCH
                    </span>
                  ) : (
                    <span className="source-label demo-label">
                      PREVIEW CATALOG
                    </span>
                  )}
                  <span className="meta-divider" />
                  <span
                    className={`source-label ${result.aiProfiled ? "" : "demo-label"}`}
                  >
                    {result.aiProfiled
                      ? "AI PROFILE ACTIVE"
                      : config.aiReady
                        ? "LOCAL PROFILE"
                        : "ADD AI KEY"}
                  </span>
                </>
              ) : (
                <span className="meta-prompt">
                  Your shortlist will show up here <ArrowDown size={15} />
                </span>
              )}
            </div>
          </div>

          {result && (
            <>
              <div className="brief-strip">
                <div className="brief-spark">
                  <Sparkles size={16} />
                </div>
                <div>
                  <span className="brief-kicker">WE HEARD YOU</span>
                  <strong>
                    {result.brief.category}
                    {result.brief.budget
                      ? ` · Under ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(result.brief.budget)}`
                      : ""}
                  </strong>
                  {preferences.length > 0 && (
                    <span className="preference-text">
                      {preferences.join(" · ")}
                    </span>
                  )}
                  {result.brief.priorityWeights?.length > 0 && (
                    <div className="priority-list" aria-label="Relative shopping priorities">
                      {result.brief.priorityWeights.map((priority) => (
                        <span className="priority-chip" key={priority.label}>
                          {priority.label}
                          <strong>{Math.round(priority.weight * 100)}%</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="edit-brief"
                  onClick={() =>
                    document.getElementById("shopping-query")?.focus()
                  }
                >
                  Edit brief <ChevronDown size={14} />
                </button>
              </div>
              {result.source === "demo" && (
                <div className="preview-notice">
                  <span className="notice-icon">
                    <PackageCheck size={16} />
                  </span>
                  <span>
                    <strong>Preview mode.</strong>{" "}
                    {config.channel3Ready
                      ? "Channel3 didn’t return live listings for this search. These sample picks are only for preview."
                      : "Add a Channel3 key to search live product listings. These sample picks are for exploring the flow."}
                  </span>
                  {config.channel3Ready ? (
                    <button
                      className="preview-retry"
                      onClick={() => void search(query)}
                    >
                      Retry live search <ArrowRight size={13} />
                    </button>
                  ) : (
                    <a href="#setup">
                      Setup <ArrowRight size={13} />
                    </a>
                  )}
                </div>
              )}
              {result.source === "channel3" && !result.aiProfiled && (
                <div className="ai-notice" role="status">
                  <Sparkles size={15} />
                  <span>
                    Gemini didn’t respond; local priority matching is being used.
                  </span>
                  <button onClick={() => void search(query)}>Try again</button>
                </div>
              )}
              <div className="product-grid">
                {result.products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    selected={product.id === selectedId}
                    onSelect={() => setSelectedId(product.id)}
                  />
                ))}
              </div>
              {result.products.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Search size={22} />
                  </div>
                  <h3>No close matches this time.</h3>
                  <p>
                    Try adjusting your budget or describing the item a different
                    way.
                  </p>
                </div>
              )}
              {selected && (
                <div className="selection-bar">
                  <div className="selection-product">
                    <span className="selected-check">
                      <Check size={14} />
                    </span>
                    <div>
                      <span>YOUR PICK</span>
                      <strong>{selected.title}</strong>
                    </div>
                  </div>
                  <div className="selection-price">
                    <span>{money(selected)}</span>
                    <button
                      disabled={result.source !== "channel3"}
                      title={
                        result.source !== "channel3"
                          ? "Checkout is available for live listings only."
                          : undefined
                      }
                      onClick={() => {
                        setPaymentMessage("");
                        setPaymentSuccess(false);
                        setCheckoutOpen(true);
                      }}
                    >
                      Review & checkout <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {!result && (
            <div className="empty-preview">
              <div className="preview-step">
                <span className="preview-step-number">01</span>
                <div className="preview-step-icon">
                  <Search size={18} />
                </div>
                <div>
                  <strong>Tell us what matters</strong>
                  <span>Item, budget, and the little details.</span>
                </div>
              </div>
              <div className="preview-connector" aria-hidden="true" />
              <div className="preview-step">
                <span className="preview-step-number">02</span>
                <div className="preview-step-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <strong>See the why, not just the what</strong>
                  <span>Every suggestion comes with a reason.</span>
                </div>
              </div>
              <div className="preview-connector" aria-hidden="true" />
              <div className="preview-step">
                <span className="preview-step-number">03</span>
                <div className="preview-step-icon">
                  <LockKeyhole size={18} />
                </div>
                <div>
                  <strong>You make the final call</strong>
                  <span>Nothing moves until you say so.</span>
                </div>
              </div>
              <div className="preview-bottom-note">
                <span className="preview-note-doodle">✳</span>
                <span>A little more intention. A lot less overwhelm.</span>
              </div>
            </div>
          )}
        </section>

        <section id="how-it-works" className="how-section">
          <div className="how-left">
            <div className="eyebrow">
              <span className="eyebrow-line" /> HOW CARTPILOT WORKS
            </div>
            <h2>
              Helpful, never
              <br />
              <em>pushy.</em>
            </h2>
            <p>
              Shopping should feel like a good recommendation from a friend,
              not a race to checkout.
            </p>
          </div>
          <div className="how-cards">
            <article>
              <span className="how-number">01</span>
              <ListFilter size={20} />
              <h3>We understand your brief</h3>
              <p>
                Gemini turns your words into weighted shopping priorities. Product
                listings are compared against those priorities locally.
              </p>
            </article>
            <article>
              <span className="how-number">02</span>
              <Scale size={20} />
              <h3>We show the trade-offs</h3>
              <p>
                See a grounded fit reason and a listing-based trade-off, alongside
                real prices from Channel3.
              </p>
            </article>
            <article>
              <span className="how-number">03</span>
              <ShieldCheck size={20} />
              <h3>You stay in control</h3>
              <p>
                PayPal Sandbox demonstrates the approval step. No retailer order
                is placed by this prototype.
              </p>
            </article>
          </div>
        </section>

        <section id="about" className="promise-section">
          <div className="promise-mark">
            <ShieldCheck size={23} />
          </div>
          <div>
            <div className="eyebrow">OUR PROMISE TO YOU</div>
            <h2>Helpful AI. Human decisions.</h2>
            <p>
              CartPilot can search, compare, and explain. It can’t spend your
              money for you. You see the item and the total before PayPal
              opens, and checkout only completes after your approval.
            </p>
          </div>
          <div className="promise-stamp">
            BUYER
            <br />
            FIRST <span>✳</span>
          </div>
        </section>
      </main>

      <footer className="footer" id="setup">
        <div className="footer-brand">
          <a className="brand" href="#top">
            <span className="brand-mark">
              <BrandMark size={18} />
            </span>
            <span>
              cartpilot<span className="brand-period">.</span>
            </span>
          </a>
          <span>Shopping, thoughtfully done.</span>
        </div>
        <div className="footer-status">
          <span className="live-dot" /> PAYPAL{" "}
          {config.paypalEnvironment.toUpperCase()}{" "}
          {config.paypalEnvironment === "sandbox"
            ? "· TEST MODE"
            : "· LIVE MODE"}
        </div>
        <div className="footer-links">
          <a
            href="https://developer.paypal.com/dashboard/"
            target="_blank"
            rel="noreferrer"
          >
            PayPal Developer <ExternalLink size={12} />
          </a>
          <a
            href="https://trychannel3.com/developers"
            target="_blank"
            rel="noreferrer"
          >
            Channel3 <ExternalLink size={12} />
          </a>
        </div>
        <div className="footer-disclaimer">
          Demo project · Sandbox purchases only · No real money is charged
        </div>
      </footer>

      {checkoutOpen && selected && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCheckoutOpen(false);
          }}
        >
          <section
            className="checkout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            <button
              className="modal-close"
              onClick={() => setCheckoutOpen(false)}
              aria-label="Close checkout"
            >
              <X size={19} />
            </button>
            {paymentSuccess ? (
              <div className="success-state">
                <div className="success-icon">
                  <Check size={28} />
                </div>
                <span className="modal-eyebrow">ALL SET</span>
                  <h2 id="checkout-title">Sandbox payment approved.</h2>
                <p>{paymentMessage}</p>
                <button
                  className="done-button"
                  onClick={() => setCheckoutOpen(false)}
                >
                  Back to CartPilot <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <>
                <div className="modal-eyebrow">
                  <span className="eyebrow-line" /> YOUR FINAL LOOK
                </div>
                <h2 id="checkout-title">One last look.</h2>
                <p className="modal-intro">
                  Make sure this feels right. PayPal will open next so you can
                  approve or cancel.
                </p>
                <div className="checkout-product">
                  <img src={selected.image} alt="" />
                  <div>
                    <span>
                      {selected.brand || selected.retailer || "YOUR PICK"}
                    </span>
                    <strong>{selected.title}</strong>
                    <small>{selected.retailer || "Online retailer"}</small>
                  </div>
                  <b>{money(selected)}</b>
                </div>
                <div className="checkout-total">
                  <span>Total today</span>
                  <strong>{money(selected)}</strong>
                </div>
                <div className="checkout-assurance">
                  <LockKeyhole size={15} />
                  <span>Secure checkout by PayPal · Sandbox mode</span>
                  <span className="sandbox-tiny">TEST</span>
                </div>
                {paymentMessage && (
                  <div
                    className={`payment-message ${paymentSuccess ? "payment-ok" : ""}`}
                    role="status"
                  >
                    {paymentMessage}
                  </div>
                )}
                {result?.source !== "channel3" ? (
                  <div className="credentials-callout">
                    <strong>Live product data is needed for checkout.</strong>
                    <span>
                      This preview listing is for exploring the flow. Add a
                      Channel3 key and search again to enable PayPal Sandbox
                      checkout.
                    </span>
                    <a
                      href="https://trychannel3.com/developers"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Get a Channel3 participant key <ExternalLink size={13} />
                    </a>
                  </div>
                ) : config.paypalClientId ? (
                  <PayPalButton
                    clientId={config.paypalClientId}
                    product={selected}
                    onSuccess={handleSuccess}
                    onError={handlePaymentError}
                  />
                ) : (
                  <div className="credentials-callout">
                    <strong>
                      PayPal checkout needs your Sandbox app keys.
                    </strong>
                    <span>
                      Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to your
                      local .env file, then restart CartPilot.
                    </span>
                    <a
                      href="https://developer.paypal.com/dashboard/applications/sandbox"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open PayPal Developer Dashboard <ExternalLink size={13} />
                    </a>
                  </div>
                )}
                <p className="checkout-footnote">
                  Sandbox payment to CartPilot's test merchant only; it does not
                  place a retailer order.
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
