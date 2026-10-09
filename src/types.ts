export type CategoryId = number | null;

export interface Category {
  id: CategoryId;
  name: string;
}

export interface SortOption {
  id: "rating" | "price" | "title";
  order: "asc" | "desc";
  name: string;
}

export interface Pizza {
  id: number | string;
  imageUrl?: string;
  title: string;
  types: number[];
  sizes: number[];
  price: number;
  category: number;
  rating: number;
}

export interface CartItem extends Pizza {
  cartId: number;
  type: number;
  size: number;
  count: number;
}

export interface Customer {
  name: string;
  address: string;
  phone: string;
}

export interface OrderProduct {
  id: number | string;
  title: string;
  price: number;
  type: number;
  size: number;
  count: number;
}

export interface Order extends Customer {
  id: number | string;
  products: OrderProduct[];
  totalPrice: number;
  delivered: boolean;
}

export interface ProductForm {
  title: string;
  imageUrl: string;
  price: string | number;
  category: number | string;
  rating: number | string;
  types: number[];
  sizes: number[];
}

export interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}
