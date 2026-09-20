/**
 * Manual — the design system read as a book.
 *
 * A fixed index on the left: every part, every plate, numbered, text only,
 * the current plate in full ink with the gold underline. The plate on the
 * right with a running head (part · number · name). The
 * landing plate is the contents. The plate key rides the URL hash so a
 * link lands on a plate.
 */

import { useEffect, useState, type CSSProperties } from "react";

import { mountStyle, motion, palette, typography, useVoicesTheme } from "../theme";
import { allPlates, findPlate, PARTS, type NumberedPlate } from "./catalog";
import { MICRO, MUTED } from "./plates/text";

const STYLE_ID = "sv-manual";
const CSS = `
.svm{display:grid;grid-template-columns:240px 1fr;min-height:100vh}
.svm-index{position:sticky;top:0;align-self:start;height:100vh;overflow:auto;padding:22px 20px 32px;display:grid;gap:22px;align-content:start}
.svm-row{display:grid;grid-template-columns:38px 1fr;gap:8px;align-items:baseline;background:none;border:0;padding:3px 0;text-align:left;cursor:pointer;color:var(--sv-ink-2);font-family:${typography.body};font-size:13px;font-weight:500;font-variant-numeric:tabular-nums}
.svm-row span:last-child{position:relative;display:inline-block}
.svm-row span:last-child::after{content:"";position:absolute;left:0;right:0;bottom:-2px;height:3px;background:var(--sv-gold);transform:scaleX(0);transform-origin:left;transition:transform ${motion.underline}}
.svm-row:hover span:last-child::after,.svm-row:focus-visible span:last-child::after,.svm-row[aria-current="true"] span:last-child::after{transform:scaleX(1)}
.svm-row[aria-current="true"]{color:var(--sv-ink);font-weight:600}
.svm-row:focus-visible{outline:2px solid var(--sv-blue);outline-offset:2px}
.svm-row[data-planned="true"] span:first-child{color:var(--sv-ink-3)}
.svm-plate{padding:28px 32px 64px;min-width:0}
.svm-sheet{background:var(--sv-surface);border-radius:12px;box-shadow:var(--sv-shadow);padding:28px 32px 36px;display:grid;gap:26px;max-width:960px}
@media (max-width:820px){.svm{grid-template-columns:1fr}.svm-index{position:static;height:auto}.svm-plate{padding:16px}}
`;

function readHash(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace(/^#/, "");
}

export function Manual() {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  const [key, setKey] = useState(readHash);
  useEffect(() => {
    const onHash = () => setKey(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const plate = key ? findPlate(key) : null;
  const go = (next: string) => {
    window.location.hash = next;
    setKey(next);
  };

  return (
    <div className="svm">
      <Index current={plate} onSelect={go} onContents={() => go("")} />
      <main className="svm-plate">
        {plate ? <Plate plate={plate} /> : <Contents onSelect={go} />}
      </main>
    </div>
  );
}

function Index({
  current,
  onSelect,
  onContents,
}: {
  current: NumberedPlate | null;
  onSelect: (key: string) => void;
  onContents: () => void;
}) {
  const { mode, toggle } = useVoicesTheme();
  return (
    <nav className="svm-index" aria-label="Manual index">
      <div style={{ display: "grid", gap: 10 }}>
        <button
          type="button"
          onClick={onContents}
          style={{
            background: "none",
            border: 0,
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
            fontFamily: typography.display,
            fontSize: 26,
            lineHeight: 0.95,
            color: "var(--sv-ink)",
            textShadow: `${typography.displayOffsetSmall} ${palette.gold}`,
          }}
        >
          Steeler Voices
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={MICRO}>Design system</span>
          <button
            type="button"
            className="svm-row"
            style={{ display: "inline", padding: 0 }}
            onClick={toggle}
          >
            <span>{mode === "dark" ? "Light" : "Dark"}</span>
          </button>
        </div>
      </div>
      {PARTS.map((part, partIndex) => (
        <div key={part.key} style={{ display: "grid", gap: 4 }}>
          <div style={{ ...MICRO, marginBottom: 4 }}>
            {String(partIndex + 1).padStart(2, "0")} · {part.label}
          </div>
          {part.plates.map((plate, plateIndex) => (
            <button
              key={plate.key}
              type="button"
              className="svm-row"
              aria-current={current?.key === plate.key ? "true" : undefined}
              data-planned={plate.status === "planned"}
              onClick={() => onSelect(plate.key)}
            >
              <span>
                {String(partIndex + 1).padStart(2, "0")}.{plateIndex + 1}
              </span>
              <span>{plate.label}</span>
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}

const HEAD: CSSProperties = { ...MICRO, display: "flex", gap: 10, flexWrap: "wrap" };

function Plate({ plate }: { plate: NumberedPlate }) {
  return (
    <article className="svm-sheet" aria-labelledby={`plate-${plate.key}`}>
      <header style={{ display: "grid", gap: 8 }}>
        <div style={HEAD}>
          <span>{plate.part.label}</span>
          <span>·</span>
          <span>{plate.number}</span>
          {plate.status === "planned" ? (
            <>
              <span>·</span>
              <span style={{ color: "var(--sv-ink-3)" }}>Planned</span>
            </>
          ) : null}
        </div>
        <h1
          id={`plate-${plate.key}`}
          style={{
            margin: 0,
            fontFamily: typography.display,
            fontWeight: 400,
            fontSize: 40,
            lineHeight: 0.95,
            textShadow: `${typography.displayOffsetSmall} ${palette.gold}`,
          }}
        >
          {plate.label}
        </h1>
      </header>
      {plate.Component ? <plate.Component /> : plate.spec ? <Planned spec={plate.spec} /> : null}
    </article>
  );
}

function Planned({ spec }: { spec: { what: string; props: string[] } }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <p style={{ ...MUTED, color: "var(--sv-ink)" }}>{spec.what}</p>
      {spec.props.length ? (
        <div style={{ display: "grid", gap: 6 }}>
          <div style={MICRO}>Props</div>
          <ul style={{ ...MUTED, paddingLeft: 18, display: "grid", gap: 2 }}>
            {spec.props.map((prop) => (
              <li key={prop}>
                <code style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12.5 }}>
                  {prop}
                </code>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Contents({ onSelect }: { onSelect: (key: string) => void }) {
  const plates = allPlates();
  const built = plates.filter((p) => p.status === "built").length;
  return (
    <article className="svm-sheet">
      <header style={{ display: "grid", gap: 8 }}>
        <div style={HEAD}>
          <span>Contents</span>
          <span>·</span>
          <span>
            {built} of {plates.length} built
          </span>
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: typography.display,
            fontWeight: 400,
            fontSize: 40,
            lineHeight: 0.95,
            textShadow: `${typography.displayOffsetSmall} ${palette.gold}`,
          }}
        >
          Every plate
        </h1>
      </header>
      <div style={{ display: "grid", gap: 22 }}>
        {PARTS.map((part, partIndex) => (
          <div key={part.key} style={{ display: "grid", gap: 6 }}>
            <div style={MICRO}>
              {String(partIndex + 1).padStart(2, "0")} · {part.label}
            </div>
            {part.plates.map((plate, plateIndex) => (
              <button
                key={plate.key}
                type="button"
                className="svm-row"
                data-planned={plate.status === "planned"}
                style={{ gridTemplateColumns: "44px 1fr" }}
                onClick={() => onSelect(plate.key)}
              >
                <span>
                  {String(partIndex + 1).padStart(2, "0")}.{plateIndex + 1}
                </span>
                <span>{plate.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </article>
  );
}
