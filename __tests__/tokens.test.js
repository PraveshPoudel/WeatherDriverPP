import { colors, radius, spacing, type } from "../src/theme/tokens";

test("theme tokens exist and are reasonable", () => {
  expect(colors.primary).toMatch(/^#/);
  expect(radius.md).toBeGreaterThan(0);
  expect(spacing.lg).toBeGreaterThan(spacing.sm);
  expect(type.h1.fontSize).toBeGreaterThan(type.body.fontSize);
});
