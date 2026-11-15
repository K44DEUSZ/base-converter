import assert from "node:assert/strict";
import test from "node:test";
import {
  parseInteger,
  formatInteger,
  getPlaceValues,
  getDivisionSteps,
  maxNumberBits,
  maxNumberDigits,
  numberBases,
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

test("public display metadata cannot change parser rules", () => {
  const original = numberBases.map((item) => ({ ...item }));
  try {
    numberBases[0].prefix = "";
    numberBases[1].value = 2;
    numberBases.splice(2, 2);
    assert.equal(parseInteger("0b101", 2).value, 5n);
    assert.equal(parseInteger("0o17", 8).value, 15n);
    assert.equal(parseInteger("0x2D", 16).value, 45n);
    assert.throws(() => parseInteger("0b10", 10), { code: "prefix_mismatch" });
    assert.throws(() => parseInteger("0x10", 2), { code: "prefix_mismatch" });
  } finally {
    numberBases.splice(0, numberBases.length, ...original);
  }
});

test("exact signed conversions and explanations agree across deterministic wide integers", () => {
  const values = new Set([0n, 1n, -1n]);
  for (const bits of [2, 8, 31, 32, 53, 64, 127, 128, 511, 512, 1023, 2047, 2048]) {
    const boundary = (1n << BigInt(bits)) - 1n;
    for (const value of [boundary, boundary - 1n, -boundary]) values.add(value);
  }
  let state = 123456789n;
  for (let index = 0; index < 64; index += 1) {
    state = (state * 6364136223846793005n + 1442695040888963407n) & ((1n << 128n) - 1n);
    values.add(index % 2 ? -state : state);
  }
  for (const value of values) {
    const magnitude = value < 0n ? -value : value;
    for (const base of [2, 8, 10, 16]) {
      const expected = value.toString(base).toUpperCase();
      assert.equal(formatInteger(value, base), expected);
      assert.equal(parseInteger(expected, base).value, value);
      assert.equal(
        getPlaceValues(expected, base).reduce((sum, part) => sum + part.contribution, 0n),
        magnitude,
      );
      assert.equal(
        getDivisionSteps(value, base)
          .map((step) => step.remainder)
          .reverse()
          .join(""),
        magnitude.toString(base).toUpperCase(),
      );
    }
  }
});

test("resource limits, normalized signs and JavaScript input errors have stable contracts", () => {
  const maximum = (1n << BigInt(maxNumberBits)) - 1n;
  for (const base of [2, 8, 10, 16]) {
    assert.equal(parseInteger(maximum.toString(base), base).value, maximum);
    assert.equal(parseInteger("0".repeat(maxNumberDigits), base).value, 0n);
    assert.throws(() => parseInteger("0".repeat(maxNumberDigits + 1), base), {
      code: "max_digits",
    });
    assert.throws(() => formatInteger(-maximum - 1n, base), { code: "max_bits" });
    assert.throws(() => getDivisionSteps(maximum + 1n, base), { code: "max_bits" });
    for (const value of [null, undefined, 1, "1", {}, NaN]) {
      assert.throws(() => formatInteger(value, base), TypeError);
      assert.throws(() => getDivisionSteps(value, base), TypeError);
    }
  }
  assert.throws(() => parseInteger((1n << 2048n).toString(16), 16), { code: "max_bits" });
  for (const text of ["-0", "+0", " -0x00 "]) {
    assert.equal(parseInteger(text, text.includes("x") ? 16 : 10).negative, false);
  }
  for (const value of [null, undefined, 1, 1n, {}, ["1"]])
    assert.throws(() => parseInteger(value, 10), TypeError);
  for (const base of [null, "2", 0, 1, 3, 36, NaN, Infinity])
    assert.throws(() => parseInteger("1", base), { name: "NumberError", code: "invalid_base" });
  for (const text of ["--1", "++1", "+-1", "1.0", "1_000", "1 0"])
    assert.throws(() => parseInteger(text, 10), { code: "invalid_digit" });
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
