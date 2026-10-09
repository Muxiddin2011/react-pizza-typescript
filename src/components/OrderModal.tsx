import { useState, type FormEvent } from "react";
import type { CartItem, Customer } from "../types";

interface OrderModalProps {
  items: CartItem[];
  totalPrice: number;
  onClose: () => void;
  onSubmit: (customer: Customer) => Promise<void>;
  saving: boolean;
}

export default function OrderModal({ items, totalPrice, onClose, onSubmit, saving }: OrderModalProps) {
  const [form, setForm] = useState<Customer>({ name: "", address: "", phone: "" });
  const [error, setError] = useState("");
  const change = (key: keyof Customer, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.phone.trim()) { setError("Iltimos, barcha maydonlarni to‘ldiring."); return; }
    setError("");
    await onSubmit(form);
  }

  return <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal order-modal">
      <div className="modal__header"><h2>Buyurtma berish</h2><button className="modal__close" type="button" onClick={onClose}>✕</button></div>
      {error && <div className="admin-modal__error">{error}</div>}
      <form className="order-form" onSubmit={submit}>
        <input value={form.name} onChange={(e) => change("name", e.target.value)} placeholder="Ism" />
        <input value={form.address} onChange={(e) => change("address", e.target.value)} placeholder="Manzil" />
        <input value={form.phone} onChange={(e) => change("phone", e.target.value)} placeholder="Telefon raqam" type="tel" />
        <div className="order-summary"><span>{items.reduce((s, i) => s + i.count, 0)} ta mahsulot</span><b>{totalPrice.toLocaleString()} ₽</b></div>
        <button className="button button--pay order-submit" disabled={saving} type="submit">{saving ? "Yuborilmoqda..." : "Buyurtma berish"}</button>
      </form>
    </div>
  </div>;
}
