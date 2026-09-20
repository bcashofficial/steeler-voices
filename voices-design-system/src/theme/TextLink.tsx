/**
 * TextLink — the one control. Text, and a 3px gold underline that draws in
 * from the left on hover and focus; `current` keeps it and sets the text
 * to full ink at 600. Renders as an anchor with `href` or a button with
 * `onClick`. Nothing on the platform looks like a button.
 */

import { useEffect, type CSSProperties, type MouseEvent, type ReactNode } from "react";

import { mountStyle } from "./styles";
import { motion, typography } from "./tokens";

export interface TextLinkProps {
  children: ReactNode;
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  current?: boolean;
  size?: "sm" | "md";
  /** ARIA role when the link is a tab or menu item. */
  role?: string;
  "aria-selected"?: boolean;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-haspopup"?: "menu" | "dialog";
  id?: string;
  className?: string;
  style?: CSSProperties;
}

const STYLE_ID = "sv-textlink";
const CSS = `
.sv-textlink{position:relative;display:inline-flex;align-items:center;gap:6px;background:none;border:0;padding:4px 2px;color:var(--sv-ink-2);font-family:${typography.body};font-weight:500;cursor:pointer;text-decoration:none;line-height:1.2}
.sv-textlink[data-size="sm"]{font-size:12.5px}
.sv-textlink[data-size="md"]{font-size:13px}
.sv-textlink::after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--sv-gold);transform:scaleX(0);transform-origin:left;transition:transform ${motion.underline}}
.sv-textlink:hover::after,.sv-textlink:focus-visible::after,.sv-textlink[aria-current]::after,.sv-textlink[aria-selected="true"]::after{transform:scaleX(1)}
.sv-textlink[aria-current],.sv-textlink[aria-selected="true"]{color:var(--sv-ink);font-weight:600}
.sv-textlink:focus-visible{outline:2px solid var(--sv-blue);outline-offset:2px}
@media (prefers-reduced-motion: reduce){.sv-textlink::after{transition:none}}
`;

export function TextLink({
  children,
  href,
  onClick,
  current = false,
  size = "md",
  role,
  id,
  className,
  style,
  ...aria
}: TextLinkProps) {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  const classes = ["sv-textlink", className].filter(Boolean).join(" ");
  const shared = {
    className: classes,
    "data-size": size,
    "aria-current": current ? ("page" as const) : undefined,
    role,
    id,
    style,
    ...aria,
  };
  if (href) {
    return (
      <a href={href} onClick={onClick} {...shared}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} {...shared}>
      {children}
    </button>
  );
}
