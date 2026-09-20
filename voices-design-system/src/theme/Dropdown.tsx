/**
 * Dropdown — a soft field showing the current choice with a chevron; open,
 * a lifted sheet of options, the chosen one marked with a gold square and
 * set in 600, a drawn count at the right when an option carries one. An
 * optional small label sits above the field. Arrow keys move, Enter picks,
 * Esc and a click away close.
 */

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

import { StencilNumber } from "./StencilNumber";
import { mountStyle } from "./styles";
import { motion, typography } from "./tokens";

export interface DropdownOption<K extends string = string> {
  key: K;
  label: string;
  count?: number;
}

export interface DropdownProps<K extends string = string> {
  options: readonly DropdownOption<K>[];
  value: K | null;
  onChange: (key: K) => void;
  /** Shown in the field when nothing is chosen. */
  placeholder?: string;
  label?: string;
  size?: "sm" | "md";
  style?: CSSProperties;
}

const STYLE_ID = "sv-dropdown";
const CSS = `
.sv-dd{position:relative;display:grid;gap:6px;min-width:0}
.sv-dd-label{font-family:${typography.body};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--sv-ink-2)}
.sv-dd-field{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;border:0;border-radius:8px;background:var(--sv-field);color:var(--sv-ink);font-family:${typography.body};font-weight:500;cursor:pointer;text-align:left;transition:box-shadow ${motion.underline},background ${motion.underline}}
.sv-dd-field[data-size="md"]{height:36px;padding:0 12px;font-size:13.5px}
.sv-dd-field[data-size="sm"]{height:30px;padding:0 10px;font-size:12.5px}
.sv-dd-field:hover{box-shadow:inset 0 0 0 1px var(--sv-line-strong)}
.sv-dd-field:focus-visible{outline:2px solid var(--sv-blue);outline-offset:2px}
.sv-dd-field[aria-expanded="true"]{box-shadow:inset 0 0 0 1px var(--sv-line-strong)}
.sv-dd-field[data-empty="true"]{color:var(--sv-ink-2)}
.sv-dd-chevron{width:12px;height:12px;flex:none;color:var(--sv-ink-2);transition:transform ${motion.underline}}
.sv-dd-field[aria-expanded="true"] .sv-dd-chevron{transform:rotate(180deg)}
.sv-dd-sheet{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:40;margin:0;padding:6px;list-style:none;background:var(--sv-surface);border-radius:12px;box-shadow:var(--sv-shadow-lift);display:grid;gap:2px;animation:sv-dd-open 160ms ease both}
.sv-dd-option{display:grid;grid-template-columns:10px 1fr auto;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;color:var(--sv-ink);font-family:${typography.body};font-size:13px;font-weight:500}
.sv-dd-option:hover,.sv-dd-option[data-active="true"]{background:var(--sv-hover)}
.sv-dd-option[aria-selected="true"]{font-weight:600}
.sv-dd-mark{width:8px;height:8px;border-radius:2px;background:var(--sv-gold);box-shadow:inset 0 0 0 1px var(--sv-ink);opacity:0}
.sv-dd-option[aria-selected="true"] .sv-dd-mark{opacity:1}
@keyframes sv-dd-open{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.sv-dd-sheet{animation:none}.sv-dd-chevron,.sv-dd-field{transition:none}}
`;

export function Dropdown<K extends string = string>({
  options,
  value,
  onChange,
  placeholder = "",
  label,
  size = "md",
  style,
}: DropdownProps<K>) {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.key === value),
  );
  const [active, setActive] = useState(selectedIndex);
  const current = options.find((o) => o.key === value) ?? null;

  useEffect(() => {
    if (!open) return;
    const away = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  const show = (next: boolean) => {
    setOpen(next);
    if (next) setActive(selectedIndex);
  };
  const pick = (index: number) => {
    onChange(options[index].key);
    setOpen(false);
  };
  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return show(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + options.length) % options.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) pick(active);
      else show(true);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="sv-dd" style={style}>
      {label ? (
        <span className="sv-dd-label" id={`${id}-label`}>
          {label}
        </span>
      ) : null}
      <button
        type="button"
        className="sv-dd-field"
        data-size={size}
        data-empty={current === null}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={label ? `${id}-label ${id}-field` : undefined}
        id={`${id}-field`}
        onClick={() => show(!open)}
        onKeyDown={onKey}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {current ? current.label : placeholder}
        </span>
        <svg className="sv-dd-chevron" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M2 4l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <ul
          className="sv-dd-sheet"
          role="listbox"
          id={`${id}-list`}
          aria-activedescendant={`${id}-opt-${active}`}
        >
          {options.map((option, index) => (
            <li
              key={option.key}
              id={`${id}-opt-${index}`}
              role="option"
              aria-selected={option.key === value}
              data-active={index === active}
              className="sv-dd-option"
              onMouseEnter={() => setActive(index)}
              onClick={() => pick(index)}
            >
              <span className="sv-dd-mark" aria-hidden="true" />
              <span>{option.label}</span>
              {option.count != null ? (
                <StencilNumber
                  value={option.count}
                  height={12}
                  offset={0}
                  color="var(--sv-ink-3)"
                />
              ) : (
                <span />
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
