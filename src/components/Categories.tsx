import { categories } from "./categoriesData";
import type { CategoryId } from "../types";

interface CategoriesProps {
  activeCategory: CategoryId;
  onChange: (category: CategoryId) => void;
}

export default function Categories({ activeCategory, onChange }: CategoriesProps) {
  return (
    <ul className="categories">
      {categories.map((category) => (
        <li
          key={String(category.id)}
          className={activeCategory === category.id ? "active" : ""}
        >
          <button type="button" onClick={() => onChange(category.id)}>
            {category.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
