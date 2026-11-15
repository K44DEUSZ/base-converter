# base-converter

[English version](README.en.md)

Konwerter liczb między zapisem binarnym, ósemkowym, dziesiętnym i szesnastkowym. Poza wynikiem udostępnia rozkład pozycyjny i kolejne kroki dzielenia, jeśli chcesz pokazać, skąd wzięło się przeliczenie.

## Jak użyć

Pobierz paczkę wybranego wydania z [Releases](https://github.com/K44DEUSZ/base-converter/releases), a następnie zainstaluj ją w swoim projekcie:

```sh
npm install ./k44deusz-base-converter-1.0.1.tgz
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

## API

| Eksport                                        | Wejście i wynik                                                                                                                                                                   |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parseInteger(text, base)`                     | Tekst i podstawa `2`, `8`, `10` lub `16`. Zwraca `{ value: bigint, digits: string, negative: boolean }`.                                                                          |
| `formatInteger(value, base)`                   | `bigint` i podstawa. Zwraca tekst z wielkimi literami, bez prefiksu.                                                                                                              |
| `getPlaceValues(text, base)`                   | Jak parser. Zwraca tablicę `{ character, position, digit, contribution: bigint }` od najstarszej cyfry.                                                                           |
| `getDivisionSteps(value, base)`                | `bigint` i podstawa. Zwraca `{ dividend: bigint, quotient: bigint, remainder: string }[]`, od pierwszego dzielenia. Odwrócenie kolejności reszt daje zapis wartości bezwzględnej. |
| `numberBases`                                  | Metadane `{ value, label, prefix }` czterech podstaw, do budowania interfejsu. Ich modyfikacja w JavaScript nie zmienia reguł parsera.                                            |
| `maxNumberBits`, `maxNumberDigits`             | Oba limity wynoszą `2048`.                                                                                                                                                        |
| `NumberBase`, `NumberErrorCode`, `NumberError` | Typy TypeScript i klasa błędu rozszerzająca `RangeError`.                                                                                                                         |

Parser usuwa zewnętrzne białe znaki, przyjmuje pojedynczy `+` lub `-` i zachowuje zera wiodące w `digits`. `negative` jest zawsze `false` dla zera. Ułamki, separatory tysięcy i podkreślenia są odrzucane. Limit cyfr dotyczy tekstu po usunięciu znaku i prefiksu; limit bitów dotyczy wartości bezwzględnej. Dla zera lista dzielenia zawiera jeden krok z resztą `"0"`.

`numberBases` pozostaje mutowalne w JavaScript dla zgodności z dotychczasowym API. Zmiana rekordów lub kolejności może zmienić Twój interfejs korzystający z tych metadanych, ale nie wspierane podstawy ani reguły prefiksów parsera. Typy TypeScript nadal traktują metadane jako tylko do odczytu.

`NumberError.code` ma wartość `invalid_base`, `prefix_mismatch`, `empty_integer`, `invalid_digit`, `max_digits` lub `max_bits`. Nie-tekstowy argument parsera i argument inny niż `bigint` funkcji numerycznych powoduje `TypeError`; biblioteka nie konwertuje ich niejawnie. Kody błędów są przeznaczone do obsługi programowej i tłumaczenia komunikatów.

## Node.js i przeglądarka

Paczka jest ESM, bez zależności od frameworka i DOM. Działa w Node.js obsługującym `bigint` oraz w nowoczesnej przeglądarce, przez bundler albo bezpośredni import pliku `dist/index.js`. W Node.js użyj pliku `.mjs` lub projektu z `"type": "module"`; CommonJS `require()` nie jest osobnym eksportem paczki.

```js
import { parseInteger, NumberError } from "@k44deusz/base-converter";

try {
  const parsed = parseInteger("9007199254740993", 10);
  // bigint nie jest obsługiwany przez JSON.stringify bez konwersji.
  console.log(JSON.stringify({ value: parsed.value.toString() }));
} catch (error) {
  if (!(error instanceof NumberError)) throw error;
  console.error(error.code);
}
```

## Praca z kodem

Do pracy nad biblioteką użyj Node.js 24. Kod jest w TypeScript; wydania zawierają JavaScript ESM i deklaracje typów.

```sh
npm ci
npm run check
npm test
npm run check:package
```

Push na `main` uruchamia sprawdzenie kodu i testy. Wydanie publikuję osobno przez GitHub Actions, z numerem zapisanym w `package.json`. Automat nie zmienia tego numeru ani nie nadpisuje istniejącego wydania. Opublikowana paczka trafia do narzędzi na stronie po przejściu ich kontroli.

## Licencja

MIT. Copyright 2026 Bartosz Golat.
