interface EmptyCartProps {
  onBack: () => void;
}

export default function EmptyCart({ onBack }: EmptyCartProps) {
  return (
    <div className="empty-cart">
      <h2>Корзина пустая 🙁</h2>
      <p>Вероятней всего, вы не заказывали ещё пиццу.<br />Для того, чтобы заказать пиццу, перейди на главную страницу.</p>
      <div className="empty-cart__illustration">
        <svg width="180" height="160" viewBox="0 0 180 160" fill="none">
          <circle cx="90" cy="80" r="70" fill="#F7F3EE" />
          <circle cx="70" cy="55" r="16" fill="#F2B7A0" />
          <rect x="40" y="70" width="60" height="55" rx="10" fill="#7BC5C0" />
          <rect x="95" y="100" width="60" height="6" rx="3" fill="#B9B9B9" />
          <circle cx="105" cy="130" r="10" fill="#3B3B3B" />
          <circle cx="150" cy="130" r="10" fill="#3B3B3B" />
          <rect x="95" y="95" width="55" height="30" rx="4" fill="none" stroke="#B9B9B9" strokeWidth="4" />
        </svg>
      </div>
      <button className="button button--dark" onClick={onBack} type="button">Вернуться назад</button>
    </div>
  );
}
