import type { Order, Pizza, ProductForm, RequestOptions, SortOption } from "../types";

const API_URL = "https://6ac62394bea0e72cf5c89da6.mockapi.io";

type ApiResponse = Record<string, unknown> | unknown[] | string;

async function request<T = ApiResponse>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const text = await response.text();
    let data: unknown = {};

    if (text) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const message =
        typeof data === "object" && data !== null
          ? ((data as { error?: string; message?: string }).error ||
            (data as { message?: string }).message)
          : undefined;
      throw new Error(message || `Server xatosi: ${response.status}`);
    }

    return data as T;
  } catch (error) {
    console.error("API Error:", error);

    if (error instanceof TypeError) {
      throw new Error("Internet yoki server bilan aloqa yo'q.");
    }

    throw error;
  }
}

export function fetchPizzas({
  category = null,
  sortBy = "",
  order = "",
}: {
  category?: number | null;
  sortBy?: SortOption["id"] | "";
  order?: SortOption["order"] | "";
} = {}): Promise<Pizza[]> {
  const params = new URLSearchParams();

  if (category !== null && category !== undefined) {
    params.set("category", String(category));
  }
  if (sortBy) params.set("sortBy", sortBy);
  if (order) params.set("order", order);

  const query = params.toString();
  return request<Pizza[]>(`/pizzas${query ? `?${query}` : ""}`);
}

export function fetchAllPizzas(): Promise<Pizza[]> {
  return request<Pizza[]>("/pizzas");
}

export function createPizza(pizza: ProductForm | Pizza): Promise<Pizza> {
  return request<Pizza>("/pizzas", {
    method: "POST",
    body: JSON.stringify({ ...pizza }),
  });
}

export function updatePizza(id: number | string, pizza: ProductForm): Promise<Pizza> {
  return request<Pizza>(`/pizzas/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...pizza }),
  });
}

export function deletePizza(id: number | string): Promise<unknown> {
  return request(`/pizzas/${id}`, { method: "DELETE" });
}

export function fetchOrders(): Promise<Order[]> {
  return request<Order[]>("/orders");
}

export function createOrder(order: Omit<Order, "id">): Promise<Order> {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify({ ...order, delivered: false }),
  });
}

export async function setOrderDelivered(
  id: number | string,
  delivered = true,
): Promise<Order> {
  const order = await request<Order>(`/orders/${id}`);
  return request<Order>(`/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...order, delivered }),
  });
}
