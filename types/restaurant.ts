export type SortKey = 'relevance' | 'rating' | 'delivery' | 'cost';

export interface RestaurantOffer {
  title: string;
  description?: string;
  couponCode?: string;
  discountPercentage?: number;
  maxDiscount?: number;
}

export interface Restaurant {
  _id?: string;
  slug: string;
  name: string;
  description: string;
  cuisines: string[];
  locality: string;
  city: string;
  areaName: string;
  rating: number;
  reviewCount: number;
  deliveryTime: number;
  costForTwo: number;
  distance: number;
  imageUrl: string;
  offer?: RestaurantOffer;
  isPureVeg?: boolean;
  promoted?: boolean;
  tags?: string[];
  etaDescription?: string;
}

export interface RestaurantApiResponse {
  data: Restaurant[];
  source: 'database' | 'static';
}

