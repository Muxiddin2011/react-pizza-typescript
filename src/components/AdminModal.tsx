import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Order, Pizza, ProductForm } from "../types";
import { categories } from "./categoriesData";
import {
  createPizza,
  deletePizza,
  fetchAllPizzas,
  fetchOrders,
  setOrderDelivered,
  updatePizza,
} from "../api/pizzaApi";

const emptyForm: ProductForm = {
  title: "",
  imageUrl: "",
  price: "",
  category: 0,
  rating: 5,
  types: [0, 1],
  sizes: [26, 30, 40],
};

interface AdminModalProps {
  onClose: () => void;
}

export default function AdminModal({ onClose }: AdminModalProps) {
  const [section, setSection] = useState<"products" | "orders" | "delivered">("products");
  const [products, setProducts] = useState<Pizza[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [p, o] = await Promise.all([fetchAllPizzas(), fetchOrders()]);
      setProducts(p);
      setOrders(o);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Backend ishlamayapti.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, search],
  );
  const filteredOrders = useMemo(
    () =>
      orders.filter((o) =>
        [o.name, o.address, o.phone, o.products.map((p) => p.title).join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [orders, search],
  );
  const activeOrders = filteredOrders.filter((o) => !o.delivered);
  const deliveredOrders = filteredOrders.filter((o) => o.delivered);

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setShowProductForm(true);
  }
  function startEdit(p: Pizza) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      imageUrl: p.imageUrl || "",
      price: p.price,
      category: p.category,
      rating: p.rating,
      types: p.types || [0],
      sizes: p.sizes || [26],
    });
    setShowProductForm(true);
  }
  function change(key: keyof ProductForm, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function toggle(key: "types" | "sizes", value: number) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter((v) => v !== value)
        : [...f[key], value],
    }));
  }

  async function saveProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        category: Number(form.category),
        rating: Number(form.rating),
      };
      if (!payload.title.trim() || payload.price <= 0)
        throw new Error("Nom va narxni to‘g‘ri kiriting.");
      if (editingId === null) await createPizza(payload);
      else await updatePizza(editingId, payload);
      setShowProductForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saqlashda xato.");
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(id: number | string) {
    if (!window.confirm("Bu mahsulotni o‘chirishni xohlaysizmi?")) return;
    try {
      await deletePizza(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "O‘chirishda xato.");
    }
  }

  async function delivered(id: number | string, value: boolean) {
    try {
      await setOrderDelivered(id, value);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Buyurtmani yangilashda xato.");
    }
  }

  const orderRow = (order: Order) => (
    <div className="admin-order-row" key={order.id}>
      <div>
        <b>{order.name}</b>
        <span>{order.address}</span>
      </div>
      <div>{order.phone}</div>
      <div className="admin-products-cell">
        {order.products.map((p, i) => (
          <span key={i}>
            {p.title} ×{p.count}
          </span>
        ))}
      </div>
      <div className="admin-order-actions">
        <b>{Number(order.totalPrice).toLocaleString()} ₽</b>
        <button
          className={order.delivered ? "check check--done" : "check"}
          type="button"
          onClick={() => delivered(order.id, !order.delivered)}
        >
          {order.delivered ? "✓" : "○"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-page-overlay">
      <div className="admin-page">
        <header className="admin-page__top">
          <div className="admin-logo">
            REACT PIZZA <small>Admin page</small>
          </div>
          <div className="admin-toolbar">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />
            {section === "products" && (
              <button className="admin-add" type="button" onClick={startAdd}>
                Mahsulot qo‘shish
              </button>
            )}
            <button className="admin-close" type="button" onClick={onClose}>
              ✕
            </button>
          </div>
        </header>
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <button
              className={section === "products" ? "active" : ""}
              type="button"
              onClick={() => setSection("products")}
            >
              mahsulotlar <b>{products.length}</b>
            </button>
            <button
              className={section === "orders" ? "active" : ""}
              type="button"
              onClick={() => setSection("orders")}
            >
              Buyurtmalar <b>{activeOrders.length}</b>
            </button>
            <button
              className={section === "delivered" ? "active" : ""}
              type="button"
              onClick={() => setSection("delivered")}
            >
              Yetkazilganlar <b>{deliveredOrders.length}</b>
            </button>
          </aside>
          <main className="admin-main">
            {error && <div className="admin-modal__error">{error}</div>}
            {loading ? (
              <div className="admin-empty">Yuklanmoqda...</div>
            ) : section === "products" ? (
              <>
                <div className="admin-list-head">
                  <b>Mahsulot</b>
                  <span>Narx</span>
                  <span>Kategoriya</span>
                  <span>Amallar</span>
                </div>
                {filteredProducts.length ? (
                  filteredProducts.map((p) => (
                    <div className="admin-product-row" key={p.id}>
                      <img
                        src={
                          p.imageUrl || "https://placehold.co/60x60?text=Pizza"
                        }
                        alt=""
                      />
                      <div>
                        <b>{p.title}</b>
                        <span>⭐ {p.rating}</span>
                      </div>
                      <span>{Number(p.price).toLocaleString()} ₽</span>
                      <span>
                        {categories.find((c) => c.id === p.category)?.name ||
                          "Все"}
                      </span>
                      <div>
                        <button
                          className="mini-btn edit"
                          type="button"
                          onClick={() => startEdit(p)}
                        >
                          ✎
                        </button>
                        <button
                          className="mini-btn delete"
                          type="button"
                          onClick={() => removeProduct(p.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="admin-empty">Mahsulot topilmadi.</div>
                )}
              </>
            ) : (
              <>
                <div className="admin-order-head">
                  <span>ism</span>
                  <span>manzil</span>
                  <span>raqam</span>
                  <span>mahsulotlar</span>
                  <span>✓</span>
                </div>
                {(section === "orders" ? activeOrders : deliveredOrders)
                  .length ? (
                  (section === "orders" ? activeOrders : deliveredOrders).map(
                    orderRow,
                  )
                ) : (
                  <div className="admin-empty">Buyurtmalar yo‘q.</div>
                )}
              </>
            )}
          </main>
        </div>
        {showProductForm && (
          <div
            className="modal-overlay"
            onMouseDown={(e) =>
              e.target === e.currentTarget && setShowProductForm(false)
            }
          >
            <div className="modal admin-product-modal">
              <div className="modal__header">
                <h2>
                  {editingId === null
                    ? "Mahsulot qo‘shish"
                    : "Mahsulotni tahrirlash"}
                </h2>
                <button
                  className="modal__close"
                  type="button"
                  onClick={() => setShowProductForm(false)}
                >
                  ✕
                </button>
              </div>
              <form className="admin-form" onSubmit={saveProduct}>
                <label className="admin-form__label">
                  Nomi
                  <input
                    value={form.title}
                    onChange={(e) => change("title", e.target.value)}
                    placeholder="Masalan: Pepperoni"
                  />
                </label>
                <label className="admin-form__label">
                  Rasm URL
                  <input
                    value={form.imageUrl}
                    onChange={(e) => change("imageUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </label>
                <div className="admin-form__row">
                  <label className="admin-form__label">
                    Narx
                    <input
                      type="number"
                      min="1"
                      value={form.price}
                      onChange={(e) => change("price", e.target.value)}
                    />
                  </label>
                  <label className="admin-form__label">
                    Rating
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={form.rating}
                      onChange={(e) => change("rating", e.target.value)}
                    />
                  </label>
                </div>
                <label className="admin-form__label">
                  Kategoriya
                  <select
                    value={form.category}
                    onChange={(e) => change("category", e.target.value)}
                  >
                    {categories
                      .filter((c) => c.id !== null)
                      .map((c) => (
                        <option key={String(c.id)} value={c.id ?? ""}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </label>
                <div>
                  <div className="admin-form__mini-label">Xamir turi</div>
                  <div className="admin-form__chips">
                    {[0, 1].map((v) => (
                      <button
                        className={
                          form.types.includes(v) ? "chip active" : "chip"
                        }
                        type="button"
                        key={v}
                        onClick={() => toggle("types", v)}
                      >
                        {v === 0 ? "тонкое" : "традиционное"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="admin-form__mini-label">O‘lchamlar</div>
                  <div className="admin-form__chips">
                    {[26, 30, 40].map((v) => (
                      <button
                        className={
                          form.sizes.includes(v) ? "chip active" : "chip"
                        }
                        type="button"
                        key={v}
                        onClick={() => toggle("sizes", v)}
                      >
                        {v} см
                      </button>
                    ))}
                  </div>
                </div>
                <div className="admin-form__actions">
                  <button
                    className="button button--outline"
                    type="button"
                    onClick={() => setShowProductForm(false)}
                  >
                    Bekor qilish
                  </button>
                  <button
                    className="button button--pay"
                    disabled={saving}
                    type="submit"
                  >
                    {saving ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
