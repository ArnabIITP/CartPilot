import { ArrowUpRight, Heart, Star } from "lucide-react";
import { useState } from "react";
import type { Product } from "../types";

type Props = {
  product: Product;
  index: number;
  selected: boolean;
  onSelect: () => void;
};

export default function ProductCard({
  product,
  index,
  selected,
  onSelect,
}: Props) {
  const [saved, setSaved] = useState(false);
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency || "USD",
    maximumFractionDigits: 2,
  });
  return (
    <article
      className={`product-card ${selected ? "selected" : ""}`}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="product-image-wrap">
        {product.image ? (
          <img
            className="product-image"
            src={product.image}
            alt={product.title}
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder">
            {product.brand?.slice(0, 1) || "C"}
          </div>
        )}
        {product.badge && (
          <span className={`match-badge ${index === 0 ? "badge-green" : ""}`}>
            {product.badge}
          </span>
        )}
        <button
          className={`save-button ${saved ? "saved" : ""}`}
          aria-label={saved ? "Remove from saved items" : "Save item"}
          onClick={() => setSaved(!saved)}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-content">
        <div className="product-brand-row">
          <span>{product.brand || product.retailer || "CURATED FIND"}</span>
          {product.rating && (
            <span className="rating">
              <Star size={13} fill="currentColor" /> {product.rating.toFixed(1)}
            </span>
          )}
        </div>
        <h3>{product.title}</h3>
        <p className="match-reason">
          {product.matchReason ||
            product.description ||
            "A thoughtful option for your search."}
        </p>
        {product.tradeoff && (
          <p className="tradeoff-line">
            <strong>Good to know</strong> {product.tradeoff}
          </p>
        )}
        <div className="product-bottom">
          <div className="price-line">
            <strong>{formatter.format(product.price)}</strong>
            {product.originalPrice && (
              <del>{formatter.format(product.originalPrice)}</del>
            )}
          </div>
          <button
            className={`choose-button ${selected ? "chosen" : ""}`}
            onClick={onSelect}
          >
            {selected ? "Selected" : "Choose"} <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="retailer-line">
          <span className="retailer-dot" />{" "}
          {product.retailer || "Online retailer"}
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`View ${product.title} at retailer`}
            >
              <ArrowUpRight size={13} />
            </a>
          )}
        </div>
        {product.url && (
          <p className="commission-disclosure">
            We may earn a commission when you buy through product links.
          </p>
        )}
      </div>
    </article>
  );
}
