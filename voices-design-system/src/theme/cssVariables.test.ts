import { buildBaseCss } from "./cssVariables";

test("base css carries both themes and every mood stop", () => {
  const css = buildBaseCss();
  expect(css).toContain(":root{");
  expect(css).toContain(':root[data-theme="dark"]{');
  expect(css).toContain("--sv-ground:#FFFFFF;");
  expect(css).toContain("--sv-ground:#1D201D;");
  expect(css).toContain("--sv-mood-hyped-from:#F5E571;");
  expect(css).toContain("--sv-mood-hyped-to:#C9B52E;");
  expect(css).toContain("--sv-mood-hyped-to:#FFF6B0;");
  expect(css).toContain("--sv-leather:url(");
  expect(css).toContain("--sv-ink-2:");
  expect(css).toContain("--sv-ink-3:");
  expect(css).not.toContain("--sv-ink2:");
});
