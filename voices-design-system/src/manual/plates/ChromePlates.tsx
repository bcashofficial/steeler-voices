import { DoubleRule, Football, ThemeSwitch } from "../../theme";
import { Figure } from "./shared";

export function DoubleRulePlate() {
  return (
    <Figure label="Rule">
      <div style={{ maxWidth: 560 }}>
        <DoubleRule />
      </div>
    </Figure>
  );
}

export function FootballPlate() {
  return (
    <Figure label="Sizes">
      <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
        <Football />
        <Football size={51} />
        <Football size={68} />
      </div>
    </Figure>
  );
}

export function ThemeSwitchPlate() {
  return (
    <Figure label="Icon">
      <div>
        <ThemeSwitch />
      </div>
    </Figure>
  );
}
