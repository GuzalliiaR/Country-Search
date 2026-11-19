import createEl from './element.js';
import type { Country } from '../core/types.js';
import { FLAG_PLACEHOLDER } from './constants.js';

export default function openDetails(country: Country): void {
  function describeCountry(): string {
    const parts: string[] = [
      `${country.name} — страна в регионе ${country.region || 'неизвестно'}` +
        (country.subregion ? ` (${country.subregion})` : '') +
        '.',
    ];

    if (country.capital) parts.push(`Столица — ${country.capital}.`);
    parts.push(`Население: ${country.population.toLocaleString('ru-RU')} чел.`);

    return parts.join(' ');
  }

  function detailRow(label: string, value: string): HTMLElement {
    return createEl('p', {
      className: 'details__row',
      children: [
        createEl('span', { className: 'details__label', text: label }),
        createEl('span', { className: 'details__value', text: value }),
      ],
    });
  }

  const flag = createEl('img', {
    className: 'flag cardOpen__flag',
    attrs: {
      src: country.flagUrl === '' ? FLAG_PLACEHOLDER : country.flagUrl,
      alt: `Флаг ${country.name}`,
      loading: 'lazy',
      width: '320',
      height: '240',
    },
  });

  const rows: HTMLElement[] = [
    createEl('h2', { className: 'details__title', text: country.name }),
    createEl('p', {
      className: 'details__description',
      text: describeCountry(),
    }),
    detailRow(
      'Площадь',
      country.area === null
        ? '—'
        : `${new Intl.NumberFormat('ru-RU').format(country.area)} км²`,
    ),
    detailRow('Границы', country.borders.join(', ') || 'нет сухопутных границ'),
    detailRow(
      'Языки',
      country.languages.map((lang) => lang.name).join(', ') || '—',
    ),
    detailRow(
      'Валюта',
      country.currencies.map((c) => `${c.name} (${c.symbol})`).join(', ') ||
        '—',
    ),
    detailRow(
      'Координаты',
      country.coordinates === null
        ? '—'
        : `[${country.coordinates.lat}:${country.coordinates.lng}]`,
    ),
    detailRow('Часовые пояса', country.timezones.join(', ') || '—'),
  ];

  const info = createEl('div', {
    className: 'details__info',
    children: rows,
  });

  const dialog = createEl('dialog', {
    className: 'details',
    attrs: { 'aria-label': `Информация о стране ${country.name}` },
    children: [
      createEl('div', {
        className: 'details__body',
        children: [
          createEl('figure', {
            className: 'details__flag-wrap',
            children: [flag],
          }),
          info,
        ],
      }),
      createEl('button', {
        className: 'details__close',
        text: 'Закрыть',
        attrs: { type: 'button', 'aria-label': 'Закрыть' },
        on: { click: () => dialog.close() },
      }),
    ],
  });

  // клик по подложке (вне rect самого окна) закрывает диалог
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return; // клик по содержимому — игнорируем

    const rect = dialog.getBoundingClientRect();
    const insideDialog =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!insideDialog) dialog.close();
  });

  dialog.addEventListener('close', () => dialog.remove());

  document.body.append(dialog);
  dialog.showModal();
}
