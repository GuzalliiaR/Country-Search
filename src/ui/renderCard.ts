import createEl from './element.js';
import openDetails from './openDetails.js';
import type { Country } from '../core/types.js';
import { FLAG_PLACEHOLDER } from './constants.js';

export default function renderCard(country: Country): HTMLElement {
  const flag = createEl('img', {
    className: 'flag card__flag',
    attrs: {
      src: country.flagUrl === '' ? FLAG_PLACEHOLDER : country.flagUrl,
      alt: `Флаг ${country.name}`,
      loading: 'lazy',
      width: '48',
      height: '36',
    },
  });

  const mainInfoAboutCountry = createEl('div', {
    className: 'card__text',
    children: [
      createEl('h2', { className: 'card__name', text: country.name }),
      createEl('p', {
        className: 'card__line',
        text: `Столица: ${country.capital || '—'}`,
      }),
      createEl('p', {
        className: 'card__line',
        text: `Регион: ${country.region || '—'}`,
      }),
      createEl('p', {
        className: 'card__line',
        text: `Население: ${new Intl.NumberFormat('ru-RU').format(country.population)}`,
      }),
    ],
  });

  const card = createEl('div', {
    className: 'card',
    on: { click: () => openDetails(country) },
    children: [flag, mainInfoAboutCountry],
  });

  return card;
}
