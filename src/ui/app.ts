import { debounce } from '../core/debounce.js';
import { performSearch } from '../core/performSearch.js';
import { mapCountryResponse, type CountryCard } from '../core/mapCountryResponse.js';
import { HttpError } from '../core/searchCountries.js';

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('#app not found');

const header = el('header', 'app-header');
header.append(
  el('h1', 'app-title', '🌍 Country Search'),
  el('p', 'app-subtitle', 'Найдите страну по названию'),
);

const input = el('input', 'search-input');
input.type = 'text';
input.placeholder = 'Введите название страны...';
input.autocomplete = 'off';
input.setAttribute('aria-label', 'Поиск страны');

const statusContainer = el('div', 'status');
const resultsList = el('ul', 'results');
const detailPanel = el('div', 'detail-panel');

app.append(header, input, statusContainer, resultsList, detailPanel);

let activeController: AbortController | null = null;
let lastQuery = '';

function clearResults(): void {
  resultsList.replaceChildren();
}

function showLoading(): void {
  const wrapper = el('div', 'loading');
  wrapper.append(el('span', 'spinner'), el('span', '', 'Загрузка...'));
  statusContainer.replaceChildren(wrapper);
}

function hideStatus(): void {
  statusContainer.replaceChildren();
}

function showEmpty(): void {
  const wrapper = el('div', 'empty');
  wrapper.append(el('span', 'empty-icon', '🔍'), el('span', '', 'Ничего не найдено'));
  statusContainer.replaceChildren(wrapper);
}

function showError(message: string, retry: () => void): void {
  const wrapper = el('div', 'error');
  wrapper.append(el('span', 'error-icon', '⚠️'), el('span', '', message));
  const retryBtn = el('button', 'retry-btn', 'Повторить');
  retryBtn.addEventListener('click', retry);
  wrapper.append(retryBtn);
  statusContainer.replaceChildren(wrapper);
}

function showResults(cards: CountryCard[]): void {
  resultsList.replaceChildren();
  for (const card of cards) {
    const li = el('li', 'card');
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', `Открыть детали: ${card.name}`);

    const flag = el('span', 'card-flag', card.flag);
    const info = el('div', 'card-info');
    info.append(
      el('span', 'card-name', card.name),
      el('span', 'card-meta', [card.capital, card.region].filter(Boolean).join(' · ') || '—'),
    );

    const population = el('span', 'card-population', `${card.population.toLocaleString()} чел.`);

    li.append(flag, info, population);

    li.addEventListener('click', () => showDetail(card));
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showDetail(card);
      }
    });

    resultsList.append(li);
  }
}

function createDetailRow(label: string, value: string): HTMLElement {
  const row = el('div', 'detail-row');
  row.append(el('span', 'detail-label', label), el('span', 'detail-value', value));
  return row;
}

function closeDetail(): void {
  detailPanel.replaceChildren();
}

function showDetail(card: CountryCard): void {
  const cardEl = el('div', 'detail-card');

  const closeBtn = el('button', 'close-btn', '×');
  closeBtn.setAttribute('aria-label', 'Закрыть');
  closeBtn.addEventListener('click', closeDetail);

  cardEl.append(
    closeBtn,
    el('div', 'detail-flag', card.flag),
    el('h2', 'detail-name', card.name),
    createDetailRow('Столица', card.capital || '—'),
    createDetailRow('Регион', card.region || '—'),
    createDetailRow('Население', card.population.toLocaleString()),
    createDetailRow('Языки', card.languages || '—'),
  );

  detailPanel.replaceChildren(cardEl);
}

detailPanel.addEventListener('click', (e) => {
  if (e.target === detailPanel) closeDetail();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDetail();
});

async function runSearch(query: string): Promise<void> {
  activeController?.abort();
  activeController = new AbortController();

  lastQuery = query;
  showLoading();
  clearResults();

  try {
    const raw = await performSearch(query, activeController.signal);
    if (query !== lastQuery) return;

    if (raw.length === 0) {
      hideStatus();
      showEmpty();
      return;
    }

    const cards = raw.map(mapCountryResponse);
    hideStatus();
    showResults(cards);
  } catch (error) {
    if (query !== lastQuery) return;

    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }

    if (error instanceof DOMException && error.name === 'TimeoutError') {
      showError('Сервер не ответил вовремя. Попробуйте ещё раз.', () => {
        void runSearch(lastQuery);
      });
      return;
    }

    if (error instanceof HttpError) {
      showError(`Ошибка ${error.status}. Попробуйте ещё раз.`, () => {
        void runSearch(lastQuery);
      });
      return;
    }

    showError('Не удалось выполнить запрос. Проверьте соединение.', () => {
      void runSearch(lastQuery);
    });
  }
}

const debouncedSearch = debounce((query: string) => {
  void runSearch(query);
}, 400);

input.addEventListener('input', () => {
  const query = input.value.trim();

  activeController?.abort();
  activeController = null;

  if (query === '') {
    lastQuery = '';
    clearResults();
    hideStatus();
    closeDetail();
    return;
  }

  debouncedSearch(query);
});
