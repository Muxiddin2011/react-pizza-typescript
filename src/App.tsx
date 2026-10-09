import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Sort from "./components/Sort";
import PizzaBlock from "./components/PizzaBlock";
import Cart from "./components/Cart";
import AdminModal from "./components/AdminModal";
import OrderModal from "./components/OrderModal";
import Categories from "./components/Categories";
import { sortOptions } from "./components/categoriesData";
import { createOrder, fetchPizzas } from "./api/pizzaApi";
import type { CartItem, CategoryId, Customer, SortOption } from "./types";
import "./index.css";

let cartIdCounter = 1;
type View = "menu" | "cart";

export default function App() {
  const [view, setView] = useState<View>("menu");
  const [showAdmin, setShowAdmin] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId>(null);
  const [activeSort, setActiveSort] = useState<SortOption>(sortOptions[0]);
  const [pizzas, setPizzas] = useState<Awaited<ReturnType<typeof fetchPizzas>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderSaving, setOrderSaving] = useState(false);

  const loadPizzas = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPizzas(await fetchPizzas({ category: activeCategory, sortBy: activeSort.id, order: activeSort.order }));
    } catch (e) {
      setPizzas([]);
      setError(e instanceof Error ? e.message : "Backend ishlamayapti. Avval serverni tekshiring.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeSort]);

  useEffect(() => { void loadPizzas(); }, [loadPizzas]);

  function addToCart(newItem: Omit<CartItem, "cartId" | "count">) {
    setCartItems((current) => {
      const found = current.find((item) => item.id === newItem.id && item.type === newItem.type && item.size === newItem.size);
      if (found) return current.map((item) => item.cartId === found.cartId ? { ...item, count: item.count + 1 } : item);
      return [...current, { ...newItem, cartId: cartIdCounter++, count: 1 }];
    });
  }

  const { totalCount, totalPrice } = useMemo(() => cartItems.reduce(
    (r, item) => ({ totalCount: r.totalCount + item.count, totalPrice: r.totalPrice + item.price * item.count }),
    { totalCount: 0, totalPrice: 0 },
  ), [cartItems]);

  async function submitOrder(customer: Customer) {
    setOrderSaving(true);
    try {
      await createOrder({
        ...customer,
        products: cartItems.map(({ id, title, price, type, size, count }) => ({ id, title, price, type, size, count })),
        totalPrice,
        delivered: false,
      });
      setCartItems([]);
      setShowOrder(false);
      setView("menu");
      window.alert("Buyurtmangiz qabul qilindi!");
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Buyurtma yuborilmadi.");
    } finally {
      setOrderSaving(false);
    }
  }

  return (
    <div className="wrapper">
      <div className="container">
        <Header subtitle={view === "cart" ? "Sizning buyurtmangiz" : "Eng mazali pizza bizda"} totalPrice={totalPrice} totalCount={totalCount} onCartClick={() => setView("cart")} onAdminClick={() => setShowAdmin(true)} />
        {view === "menu" && <div>
          <div className="content__top"><Categories activeCategory={activeCategory} onChange={setActiveCategory} /><Sort activeSort={activeSort} onChange={setActiveSort} /></div>
          <h2 className="content__title">Barcha pizzalar</h2>
          {loading && <p className="state-msg">Yuklanmoqda...</p>}
          {!loading && error && <div className="state-msg state-msg--error"><p>{error}</p><button className="button button--outline" type="button" onClick={() => void loadPizzas()}>Qayta urinish</button></div>}
          {!loading && !error && !pizzas.length && <p className="state-msg">Bu kategoriyada pizza topilmadi.</p>}
          {!loading && !error && pizzas.length > 0 && <div className="pizza-grid">{pizzas.map((pizza) => <PizzaBlock key={pizza.id} pizza={pizza} cartCount={cartItems.filter((i) => i.id === pizza.id).reduce((s, i) => s + i.count, 0)} onAdd={addToCart} />)}</div>}
        </div>}
        {view === "cart" && <Cart items={cartItems} onChangeCount={(id, count) => { if (count >= 1) setCartItems((c) => c.map((i) => i.cartId === id ? { ...i, count } : i)); }} onRemove={(id) => setCartItems((c) => c.filter((i) => i.cartId !== id))} onClear={() => setCartItems([])} onBack={() => setView("menu")} onOrder={() => setShowOrder(true)} />}
      </div>
      {showOrder && <OrderModal items={cartItems} totalPrice={totalPrice} onClose={() => setShowOrder(false)} onSubmit={submitOrder} saving={orderSaving} />}
      {showAdmin && <AdminModal onClose={() => { setShowAdmin(false); void loadPizzas(); }} />}
    </div>
  );
}
