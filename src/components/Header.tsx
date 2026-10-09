interface HeaderProps {
  subtitle: string;
  totalPrice: number;
  totalCount: number;
  onCartClick: () => void;
  onAdminClick: () => void;
}

export default function Header({
  subtitle,
  totalPrice,
  totalCount,
  onCartClick,
  onAdminClick,
}: HeaderProps) {
  return (
    <header className="header">
      <button className="brand" type="button" onClick={onAdminClick} title="Admin panel">
        <span className="brand__icon">🍕</span>
        <span><b>REACT PIZZA</b><small>{subtitle}</small></span>
      </button>
      <div className="header__actions">
        <button className="header__admin-btn" type="button" onClick={onAdminClick} title="Admin panel">⚙</button>
        <button className="header__cart-btn" type="button" onClick={onCartClick}>
          {totalPrice.toLocaleString()} ₽ <span className="header__cart-divider" /> 🛒 {totalCount}
        </button>
      </div>
    </header>
  );
}
