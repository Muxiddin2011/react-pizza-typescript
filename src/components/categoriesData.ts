import type { Category, SortOption } from "../types";

export const categories: Category[] = [
  { id: null, name: "Все" },
  { id: 0, name: "Мясные" },
  { id: 1, name: "Гриль" },
  { id: 2, name: "Острые" },
  { id: 3, name: "Закрытые" },
  { id: 4, name: "Вегетарианская" },
  { id: 5, name: "Сырные" },
];

export const sortOptions: SortOption[] = [
  { id: "rating", order: "desc", name: "популярности" },
  { id: "price", order: "asc", name: "цене (дешевые)" },
  { id: "price", order: "desc", name: "цене (дорогие)" },
  { id: "title", order: "asc", name: "названию" },
];
