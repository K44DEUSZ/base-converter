export type NumberErrorCode =
  | "prefix_mismatch"
  | "empty_integer"
  | "max_digits"
  | "invalid_digit"
  | "max_bits"
  | "invalid_base";
export class NumberError extends RangeError {
  constructor(public readonly code: NumberErrorCode) {
    super(code);
    this.name = "NumberError";
  }
}
function checkBase(base: NumberBase) {
  if (![2, 8, 10, 16].includes(base)) throw new NumberError("invalid_base");
}
export const numberBases = [
  { value: 2, label: "BIN", prefix: "0b" },
  { value: 8, label: "OCT", prefix: "0o" },
  { value: 10, label: "DEC", prefix: "" },
  { value: 16, label: "HEX", prefix: "0x" },
] as const;
export type NumberBase = (typeof numberBases)[number]["value"];
const digits = "0123456789ABCDEF";
export const maxNumberBits = 2048;
export const maxNumberDigits = maxNumberBits;

export function parseInteger(text: string, base: NumberBase) {
  checkBase(base);
  if (typeof text !== "string") throw new TypeError("Expected an integer string.");
  let input = text.trim().toUpperCase();
  const negative = input.startsWith("-");
  if (/^[+-]/.test(input)) input = input.slice(1);
  const prefix = /^(0B|0O|0X)/.exec(input)?.[0];
  // 0B is also a valid unprefixed hexadecimal number (eleven).
  if (prefix && (base !== 16 || prefix !== "0B")) {
    if (prefix !== numberBases.find((item) => item.value === base)?.prefix.toUpperCase()) {
      throw new NumberError("prefix_mismatch");
    }
    input = input.slice(2);
  }
  if (!input) throw new NumberError("empty_integer");
  if (input.length > maxNumberDigits) throw new NumberError("max_digits");
  let value = 0n;
  const maximum = (1n << BigInt(maxNumberBits)) - 1n;
  for (const character of input) {
    const digit = digits.indexOf(character);
    if (digit < 0 || digit >= base) throw new NumberError("invalid_digit");
    value = value * BigInt(base) + BigInt(digit);
    if (value > maximum) throw new NumberError("max_bits");
  }
  return { value: negative ? -value : value, digits: input, negative: negative && value !== 0n };
}

export function formatInteger(value: bigint, base: NumberBase): string {
  checkBase(base);
  checkValue(value);
  return value.toString(base).toUpperCase();
}

export function getPlaceValues(input: string, base: NumberBase) {
  const parsed = parseInteger(input, base);
  input = parsed.digits;
  return Array.from(input, (character, index) => {
    const position = input.length - index - 1;
    const digit = digits.indexOf(character);
    return {
      character,
      position,
      digit,
      contribution: BigInt(digit) * BigInt(base) ** BigInt(position),
    };
  });
}

export function getDivisionSteps(value: bigint, base: NumberBase) {
  checkBase(base);
  checkValue(value);
  let dividend = value < 0n ? -value : value;
  const steps: { dividend: bigint; quotient: bigint; remainder: string }[] = [];
  do {
    const quotient = dividend / BigInt(base);
    steps.push({ dividend, quotient, remainder: digits[Number(dividend % BigInt(base))] });
    dividend = quotient;
  } while (dividend !== 0n);
  return steps;
}

function checkValue(value: bigint) {
  if (typeof value !== "bigint") throw new TypeError("Expected a bigint integer.");
  if ((value < 0n ? -value : value) >= 1n << BigInt(maxNumberBits))
    throw new NumberError("max_bits");
}
