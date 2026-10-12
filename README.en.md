# base-converter

[Wersja polska](README.md)

Convert integers between binary, octal, decimal and hexadecimal notation. The library also exposes place values and division steps when you want to explain how a conversion works.

## Usage

Download the package for your chosen version from [Releases](https://github.com/K44DEUSZ/base-converter/releases), then install it in your project:

```sh
npm install ./k44deusz-base-converter-1.0.0.tgz
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

## Development

Use Node.js 24 for development. The source is TypeScript; releases contain ESM JavaScript and type declarations.

```sh
npm ci
npm run check
npm test
```

A push to `main` runs checks and tests. Releases are published separately through GitHub Actions, using the version saved in `package.json`. Automation does not change that version or overwrite an existing release. A published release updates the dependency used by the website after its checks pass.

## License

MIT. Copyright 2026 Bartosz Golat.
