export type Product = {
  id: string;
  title: string;
  category?: string;
  brand?: string;
  image?: string;
  price: number;
  currency: string;
  retailer?: string;
  url?: string;
  description?: string;
  rating?: number;
  tradeoff?: string;
  originalPrice?: number;
  badge?: string;
  matchReason?: string;
  checkoutToken?: string;
};

export type SearchResult = {
  products: Product[];
  brief: {
    category: string;
    budget: number | null;
    preferences: string | string[];
    priorityWeights: { label: string; weight: number }[];
  };
  source: "channel3" | "demo";
  aiProfiled: boolean;
};

export type AppConfig = {
  paypalClientId: string;
  paypalEnvironment: "sandbox" | "live";
  channel3Ready: boolean;
  aiReady: boolean;
};
