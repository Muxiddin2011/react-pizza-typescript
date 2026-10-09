import type { CartItem } from "../types";

interface CartProps {
  items: CartItem[];
  onChangeCount: (id: number, count: number) => void;
  onRemove: (id: number) => void;
  onClear: () => void;
  onBack: () => void;
  onOrder: () => void;
}

export default function Cart({ items, onChangeCount, onRemove, onClear, onBack, onOrder }: CartProps) {
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.count, 0);

  if (!items.length) {
    return <section className="empty-cart"><div className="empty-cart__illustration">🛒</div><h2>Корзина пустая</h2><p>Добавьте пиццу из меню, и она появится здесь.</p><button className="button button--dark" type="button" onClick={onBack}>Вернуться в меню</button></section>;
  }

  return <section className="cart">
    <div className="cart__top"><h2>🛒 Корзина</h2><button className="cart__clear" type="button" onClick={onClear}>🗑 Очистить корзину</button></div>
    <div className="cart__items">
      {items.map((item) => <div className="cart-item" key={item.cartId}>
        <img className="cart-item__img" src={item.imageUrl || "https://placehold.co/80x80?text=Pizza"} alt="" />
        <div className="cart-item__info"><h3>{item.title}</h3><p>{item.type === 0 ? "тонкое" : "традиционное"}, {item.size} см.</p></div>
        <div className="cart-item__count"><button type="button" className="cart-item__count-btn" onClick={() => onChangeCount(item.cartId, item.count - 1)} disabled={item.count <= 1}>−</button><b>{item.count}</b><button type="button" className="cart-item__count-btn" onClick={() => onChangeCount(item.cartId, item.count + 1)}>+</button></div>
        <b className="cart-item__price">{(item.price * item.count).toLocaleString()} ₽</b>
        <button className="cart-item__remove" type="button" onClick={() => onRemove(item.cartId)}>✕</button>
      </div>)}
    </div>
    <div className="cart__bottom"><span>Всего пицц: <b>{totalCount} шт.</b></span><span>Сумма: <b className="cart__total">{totalPrice.toLocaleString()} ₽</b></span></div>
    <div className="cart__actions"><button className="button button--outline" type="button" onClick={onBack}>← Вернуться назад</button><button className="button button--pay" type="button" onClick={onOrder}>Оформить заказ →</button></div>
  </section>;
}
