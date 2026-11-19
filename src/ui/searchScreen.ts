import createEl from './element.js';
import createSearchController from '../core/searchController.js';
import renderCard from './renderCard.js';
import type { Country } from '../core/types.js';

type ResultState =
  | { type: 'init' }
  | { type: 'loading' }
  | { type: 'empty' }
  | { type: 'notEmpty'; countries: Country[] }
  | { type: 'error'; message: string };

export default function renderSearchScreen(): HTMLElement {
  let lastQuery = ''; // хранит текст последнего запроса, для повтора запроса после сообщения об ошибке

  const input = createEl('input', {
    className: 'search-input',
    attrs: {
      type: 'text',
      autocomplete: 'on',
      spellcheck: 'false',
      placeholder: 'Введите название страны на английском',
      'aria-label': 'Поиск страны',
    },
  });

  const results = createEl('div', {
    className: 'results',
    attrs: { 'aria-live': 'polite' },
  });

  function createViewInResults(state: ResultState): Node[] {
    switch (state.type) {
      case 'init':
        return [];
      case 'loading':
        return [
          createEl('div', {
            className: 'state state--spinner',
            attrs: { role: 'status', 'aria-label': 'Загрузка' },
          }),
        ];
      case 'empty':
        return [
          createEl('p', {
            className: 'state state--empty',
            text: 'По вашему запросу ничего не найдено',
          }),
        ];
      case 'notEmpty':
        return state.countries.map((country) => renderCard(country));
      case 'error':
        return [
          createEl('div', {
            className: 'state state--error',
            children: [
              createEl('p', { text: state.message }),
              createEl('button', {
                className: 'button__retry',
                text: 'Повторить запрос',
                attrs: { type: 'button' },
                on: {
                  click: () => {
                    results.replaceChildren(
                      ...createViewInResults({ type: 'loading' }),
                    );
                    searchController.onInput(lastQuery);
                  },
                },
              }),
            ],
          }),
        ];
    }
  }

  function resultHandler(countries: Country[]): void {
    let state: ResultState;

    if (countries.length === 0) {
      state = input.value.trim() === '' ? { type: 'init' } : { type: 'empty' };
    } else {
      state = { type: 'notEmpty', countries: countries };
    }

    const viewInResults = createViewInResults(state);
    results.replaceChildren(...viewInResults);
  }

  function errorHandler(message: string): void {
    const viewInResults: Node[] = createViewInResults({
      type: 'error',
      message,
    });
    results.replaceChildren(...viewInResults);
  }

  const searchController = createSearchController(
    resultHandler,
    errorHandler,
    5000,
  );

  input.addEventListener('input', () => {
    let state: ResultState;
    const query = input.value.trim();
    lastQuery = query;

    if (query === '') {
      state = { type: 'init' };
    } else {
      state = { type: 'loading' };
    }

    const viewInResults: Node[] = createViewInResults(state);
    results.replaceChildren(...viewInResults);
    searchController.onInput(query);
  });

  const form = createEl('form', {
    className: 'search-form',
    attrs: { role: 'search' },
    on: { submit: (e) => e.preventDefault() },
    children: [
      input,
      createEl('button', {
        text: 'Поиск',
        attrs: { type: 'submit' },
      }),
    ],
  });

  const section = createEl('section', {
    className: 'search-screen',
    children: [form, results],
  });

  return section;
}
