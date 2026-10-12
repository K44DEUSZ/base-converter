import assert from "node:assert/strict";
import test from "node:test";
import {
  parseInteger,
  formatInteger,
  getPlaceValues,
  getDivisionSteps,
  maxNumberBits,
  NumberError,
} from "../dist/index.js";
test("converts signed values and prefixes without floating-point loss", () => {
  for (const [text, base, expected] of [
    ["101101", 2, 45n],
    ["55", 8, 45n],
    ["45", 10, 45n],
    ["2D", 16, 45n],
    ["-0x2D", 16, -45n],
    ["0b101", 2, 5n],
    ["0B", 16, 11n],
    ["+0o55", 8, 45n],
  ])
    assert.equal(parseInteger(text, base).value, expected);
  const value = (1n << 2048n) - 1n;
  assert.equal(parseInteger(formatInteger(value, 16), 16).value, value);
  assert.equal(parseInteger("-0", 10).negative, false);
});
test("reports calculation steps which reconstruct the original magnitude", () => {
  const places = getPlaceValues("0x2D", 16);
  assert.equal(
    places.reduce((sum, part) => sum + part.contribution, 0n),
    45n,
  );
  const steps = getDivisionSteps(-45n, 2);
  assert.equal(
    steps
      .map((step) => step.remainder)
      .reverse()
      .join(""),
    "101101",
  );
  assert.deepEqual(getDivisionSteps(0n, 10), [{ dividend: 0n, quotient: 0n, remainder: "0" }]);
});
test("rejects mismatched prefixes, invalid bases and resource-limit overflows", () => {
  assert.throws(() => parseInteger("0x10", 2), { code: "prefix_mismatch" });
  assert.throws(() => parseInteger("2", 2), { code: "invalid_digit" });
  assert.throws(() => parseInteger("", 10), { code: "empty_integer" });
  assert.throws(() => parseInteger("1".repeat(2049), 2), { code: "max_digits" });
  assert.throws(() => parseInteger("1" + "0".repeat(maxNumberBits), 2), NumberError);
  assert.throws(() => getDivisionSteps(10n, 1), { code: "invalid_base" });
  assert.throws(() => formatInteger(1n << 2048n, 10), { code: "max_bits" });
  assert.throws(() => parseInteger(null, 10), TypeError);
});
