import { useState } from "react";
import { sortOptions } from "./categoriesData";
import type { SortOption } from "../types";

interface SortProps {
  activeSort: SortOption;
  onChange: (option: SortOption) => void;
}

export default function Sort({ activeSort, onChange }: SortProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sort">
      <span>Сортировка по:</span>
      <button className="sort__value" type="button" onClick={() => setOpen((v) => !v)}>
        {activeSort.name} <span>⌄</span>
      </button>
      {open && (
        <div className="sort__popup">
          {sortOptions.map((option, index) => (
            <button key={`${option.id}-${option.order}-${index}`} className={option.id === activeSort.id && option.order === activeSort.order ? "active" : ""} type="button" onClick={() => { onChange(option); setOpen(false); }}>
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
