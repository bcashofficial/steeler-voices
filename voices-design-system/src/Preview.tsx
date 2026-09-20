import { Manual } from "./manual/Manual";
import { VoicesTheme } from "./theme";

/**
 * The design system's own URL renders the manual: every part, every plate,
 * built or planned. With one consumer, this is the playground — voices-fe
 * links here rather than keeping a second copy.
 */
export function Preview() {
  return (
    <VoicesTheme>
      <Manual />
    </VoicesTheme>
  );
}
