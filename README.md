# Country Search

Живой поиск стран: ввод названия → список карточек с флагом, столицей, регионом и населением → клик по карточке открывает детали (площадь, границы, языки, валюта, часовые пояса).

Данные: [countries.dev](https://countries.dev) (`GET /name/{query}`, CORS поддержан, ключ не нужен).

**Демо:** https://guzalliiaR.github.io/Country-Search/

## Возможности

- Живой поиск с debounce 500 мс и индикатором загрузки.
- Реальная отмена устаревших запросов через `AbortController` — в Network они помечены `canceled`, а не игнорируются по времени ответа.
- Таймаут запроса через `AbortSignal.any([signal, AbortSignal.timeout(ms)])`: отмена пользователем и истечение времени различаются (`AbortError` / `TimeoutError`).
- `404` от API — дружелюбное «ничего не найдено», не ошибка.
- Прочие ошибки — сообщение с названием статуса и кнопкой «Повторить», повторяющей последний запрос.
- Адаптивная сетка карточек (3 / 2 / 1 колонка) и диалог с деталями.

## Стек

TypeScript (strict), сборка — `tsc` в ES-модули, тесты — Vitest с fake timers и моком `fetch`, ESLint + Prettier, Husky (pre-commit — lint-staged, pre-push — тесты). Без фреймворков и сторонних библиотек для debounce и кэша.

## Запуск

```bash
npm install
npm run build      # tsc → dist/
```

Открыть `index.html` в браузере (нужен локальный сервер, например `npx serve .`: ES-модули не грузятся с `file://`).

## Скрипты

| Команда               | Что делает                             |
| --------------------- | -------------------------------------- |
| `npm run build`       | компиляция TypeScript в `dist/`        |
| `npm run build:watch` | компиляция в режиме наблюдения         |
| `npm test`            | тесты Vitest, один прогон              |
| `npm run lint`        | ESLint по проекту                      |
| `npm run format`      | Prettier с автоисправлением            |
| `npm run build:site`  | сборка статического сайта в `_site/`   |
| `npm run deploy`      | публикация `_site/` в ветку `gh-pages` |

## Структура

```
src/
  core/                 логика без DOM, тестируется без браузера и сети
    debounce.ts         задержка вызова
    searchCountries.ts  fetch-обёртка: 404 → [], иначе HttpError
    httpError.ts        Error со статусом
    mapCountryResponse.ts  сырой ответ API → модель Country
    searchController.ts оркестрация: debounce + отмена + таймаут + разбор ошибок
    types.ts            RawCountry / Country
  ui/                   построение DOM (без innerHTML)
    element.ts          фабрика элементов
    searchScreen.ts     экран поиска и переключение состояний
    renderCard.ts       карточка страны
    openDetails.ts      модальный диалог с деталями
    constants.ts        путь к плейсхолдеру флага
tests/                  Vitest: unit + тест на гонку запросов
```

Подробнее о решениях — [DESIGN.md](./DESIGN.md): отмена устаревших запросов, обоснование debounce, сложность маппера, применённые принципы.
