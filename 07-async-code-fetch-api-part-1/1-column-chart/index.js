import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {

  chartHeight = 50;
  subElements = {};
  data = [];
  from = '';
  to = '';
  constructor({
    label = 0,
    link = '',
    formatHeading = data => data,
    url = '',
    range = {
      from: new Date(),
      to: new Date(),
    }
    } = {}) {

    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;


    this.render();
    this.update(this.range.from, this.range.to);
  }

  // ОТРИСОВКА
  async render() {
    // 1. создаем скелет диаграммы без данных
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
          </div>
          <div data-element="body" class="column-chart__chart">
          </div>
        </div>
      </div>`
  }

  getLink() {
      return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
    }

  getSubElements(element) {

      const result = {};
      const elements = this.element.querySelectorAll('[data-element]');

      for(const subElement of elements) {
        const name = subElement.dataset.element;
        result[name] =  subElement;
      }
      return result;

      /*** alternative
       * return [...elements].reduce((accum, subElement) => {
        accum[subElement.dataset.element] = subElement;

        return accum;
      }, {});
       * ***/
    }

  async update(from, to) {
    this.element.classList.add('column-chart_loading');

    const data = await this.loadData(from, to);

    this.setNewRange(from, to); // for what??

    if(data && Object.values(data).length) {
      this.subElements.header.textContent = this.getHeaderValue(data);
      this.subElements.body.innerHTML = this.getColumnBody(data);
    }

    this.element.classList.remove('column-chart_loading');

    return data;
  }
  // GET DATA BY URL
  async loadData(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    return await fetchJson(this.url); // возвращает объект response.json()
  }

  setNewRange(from, to) {
    this.range.from = from;
    this.range.to = to;
  }

  getHeaderValue(data) {
    return this.formatHeading(Object.values(data).reduce((accum, item) => accum + item), 0);
  }

  getColumnBody(data) {
    return this.getColumnProps(data).map(item => {
      return `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`;
      }).join('\n');
  }

  getColumnProps(data) {
    // data is an Array of values
    const maxValue = Math.max(...Object.values(data));
    const scale = this.chartHeight / maxValue;

    return Object.values(data).map(item => {
      return {
        percent:(item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  remove() {
    if(this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    // NOTE: удаляем обработчики событий, если они есть
  }

  initEventListeners() {
  }
}
