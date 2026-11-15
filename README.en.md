# base-converter

[Wersja polska](README.md)

Convert integers between binary, octal, decimal and hexadecimal notation. The library also exposes place values and division steps when you want to explain how a conversion works.

## Usage

Download the package for your chosen version from [Releases](https://github.com/K44DEUSZ/base-converter/releases), then install it in your project:

```sh
npm install ./k44deusz-base-converter-1.0.1.tgz
```

```ts
import { parseInteger, formatInteger, getDivisionSteps } from "@k44deusz/base-converter";

const { value } = parseInteger("2D", 16);
formatInteger(value, 2); // "101101"
getDivisionSteps(value, 2);
```

## Details

Calculations use `bigint` and accept signs and `0b`, `0o` or `0x` prefixes. The prefix must match the selected base. In hexadecimal, `0B` means eleven.

Input is limited to 2048 bits and 2048 digits. Place values and division steps describe the magnitude; display the sign separately. Invalid input raises `NumberError` with a stable `code`.

## API

| Export                                         | Input and result                                                                                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parseInteger(text, base)`                     | A string and base `2`, `8`, `10` or `16`. Returns `{ value: bigint, digits: string, negative: boolean }`.                                                              |
| `formatInteger(value, base)`                   | A `bigint` and base. Returns uppercase digits without a prefix.                                                                                                        |
| `getPlaceValues(text, base)`                   | Same input as the parser. Returns `{ character, position, digit, contribution: bigint }[]`, most significant digit first.                                              |
| `getDivisionSteps(value, base)`                | A `bigint` and base. Returns `{ dividend: bigint, quotient: bigint, remainder: string }[]` in division order. Reverse the remainders to obtain the magnitude's digits. |
| `numberBases`                                  | Display metadata `{ value, label, prefix }` for the four bases. JavaScript mutations do not change parsing rules.                                                      |
| `maxNumberBits`, `maxNumberDigits`             | Both limits are `2048`.                                                                                                                                                |
| `NumberBase`, `NumberErrorCode`, `NumberError` | TypeScript types and an error class extending `RangeError`.                                                                                                            |

The parser trims surrounding whitespace, accepts one `+` or `-`, and retains leading zeros in `digits`. Zero always has `negative: false`. Fractions, grouping separators and underscores are rejected. The digit limit applies after removing the sign and prefix; the bit limit applies to the magnitude. Division of zero produces one step with remainder `"0"`.

`numberBases` remains mutable in JavaScript for compatibility. Changing its records or order may change a UI built from that metadata, but not supported bases or parser prefix rules. TypeScript declarations continue to treat the metadata as read-only.

`NumberError.code` is `invalid_base`, `prefix_mismatch`, `empty_integer`, `invalid_digit`, `max_digits` or `max_bits`. Non-string parser input and non-`bigint` numerical input raise `TypeError` instead of being coerced. Use codes for programmatic handling and translated messages.

## Node.js and browsers

The package is ESM, with no framework or DOM dependency. Use it in Node.js with `bigint` support or a modern browser through a bundler or a direct import of `dist/index.js`. In Node.js, use an `.mjs` file or a project with `"type": "module"`; the package has no separate CommonJS `require()` export.

```js
import { parseInteger, NumberError } from "@k44deusz/base-converter";

try {
  const parsed = parseInteger("9007199254740993", 10);
  // JSON.stringify needs bigint values converted explicitly.
  console.log(JSON.stringify({ value: parsed.value.toString() }));
} catch (error) {
  if (!(error instanceof NumberError)) throw error;
  console.error(error.code);
}
```

## Development

Use Node.js 24 for development. The source is TypeScript; releases contain ESM JavaScript and type declarations.

```sh
npm ci
npm run check
npm test
npm run check:package
```

A push to `main` runs checks and tests. Releases are published separately through GitHub Actions, using the version saved in `package.json`. Automation does not change that version or overwrite an existing release. A published release updates the dependency used by the website after its checks pass.

## License

MIT. Copyright 2026 Bartosz Golat.
