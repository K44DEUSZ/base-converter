# base-converter

[English version](README.en.md)

Konwerter liczb między zapisem binarnym, ósemkowym, dziesiętnym i szesnastkowym. Poza wynikiem udostępnia rozkład pozycyjny i kolejne kroki dzielenia, jeśli chcesz pokazać, skąd wzięło się przeliczenie.

## Jak użyć

Pobierz paczkę wybranego wydania z [Releases](https://github.com/K44DEUSZ/base-converter/releases), a następnie zainstaluj ją w swoim projekcie:

```sh
npm install ./k44deusz-base-converter-1.0.0.tgz
```

```ts
import { parseInteger, formatInteger, getDivisionSteps } from "@k44deusz/base-converter";

const { value } = parseInteger("2D", 16);
formatInteger(value, 2); // "101101"
getDivisionSteps(value, 2);
```

## Co warto wiedzieć

Obliczenia używają `bigint`; obsługują znak liczby oraz prefiksy `0b`, `0o` i `0x`. Prefiks musi odpowiadać wybranej podstawie. Zapis `0B` w systemie szesnastkowym oznacza jedenaście.

Limit wynosi 2048 bitów i 2048 cyfr wejściowych. Rozkład pozycyjny oraz dzielenie opisują wartość bezwzględną; znak możesz wyświetlić osobno. Niepoprawne dane zgłasza `NumberError` z polem `code`.

## Praca z kodem

Do pracy nad biblioteką użyj Node.js 24. Kod jest w TypeScript; wydania zawierają JavaScript ESM i deklaracje typów.

```sh
npm ci
npm run check
npm test
```

Push na `main` uruchamia sprawdzenie kodu i testy. Wydanie publikuję osobno przez GitHub Actions, z numerem zapisanym w `package.json`. Automat nie zmienia tego numeru ani nie nadpisuje istniejącego wydania. Opublikowana paczka trafia do narzędzi na stronie po przejściu ich kontroli.

## Licencja

MIT. Copyright 2026 Bartosz Golat.
