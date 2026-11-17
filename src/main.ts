import createEl from './ui/element.js';
import renderSearchScreen from './ui/searchScreen.js';

const container = createEl('div', {
  className: 'container',
  children: [
    createEl('header', {
      className: 'page-header',
      children: [
        createEl('h1', { className: 'page-title', text: 'Country Search' }),
        createEl('p', {
          className: 'page-subtitle',
          text: 'Какую страну вы хотите найти?',
        }),
      ],
    }),
    renderSearchScreen(),
  ],
});

document.body.append(container);
