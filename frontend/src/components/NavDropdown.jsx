import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const HOVER_CLOSE_DELAY_MS = 150;

/**
 * Desktop mega-menu dropdown + mobile expandable group.
 * items: [{ label, description, to?, href?, external?, Icon }]
 */
const NavDropdown = ({
  label,
  items,
  isActive = false,
  mobile = false,
}) => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  };

  if (mobile) {
    return (
      <li className="nav-dropdown-mobile">
        <span className="nav-dropdown-mobile__label">{label}</span>
        <ul className="nav-dropdown-mobile__list">
          {items.map((item) => {
            const Icon = item.Icon;
            const content = (
              <>
                {Icon && (
                  <span className="nav-dropdown-mobile__icon">
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                )}
                <span>
                  <span className="nav-dropdown-mobile__title">{item.label}</span>
                  {item.description && (
                    <span className="nav-dropdown-mobile__desc">
                      {item.description}
                    </span>
                  )}
                </span>
              </>
            );

            return (
              <li key={item.label}>
                {item.external || item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content}
                  </a>
                ) : (
                  <Link to={item.to}>{content}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </li>
    );
  }

  return (
    <li
      className={`nav-dropdown ${isActive ? "active" : ""} ${open ? "is-open" : ""}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        className="nav-dropdown__trigger"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>{label}</span>
        <ChevronDown className="nav-dropdown__chevron" size={14} strokeWidth={2.5} />
      </button>

      <div className="nav-dropdown__panel" aria-hidden={!open}>
        <div className="nav-dropdown__card">
          {items.map((item) => {
            const Icon = item.Icon;
            const inner = (
              <>
                <span className="nav-dropdown__icon">
                  {Icon ? <Icon size={20} strokeWidth={2} /> : null}
                </span>
                <span className="nav-dropdown__text">
                  <span className="nav-dropdown__item-title">{item.label}</span>
                  {item.description && (
                    <span className="nav-dropdown__item-desc">
                      {item.description}
                    </span>
                  )}
                </span>
              </>
            );

            return item.external || item.href ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-dropdown__item"
              >
                {inner}
              </a>
            ) : (
              <Link key={item.label} to={item.to} className="nav-dropdown__item">
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </li>
  );
};

export default NavDropdown;
