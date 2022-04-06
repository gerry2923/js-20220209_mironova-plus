import fetchJson from './utils/fetch-json.js';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  constructor({
    label = '',
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

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getHeaderValue(data) {
    // с каждым элементом массива item что-то проделывается в callback функции и возвращаетсяв
    // accum
    // функция возвращает TotalValue
    return this.formatHeading(Object.values(data).reduce((accum, item) => (accum + item), 0));
  }

  async loadData(from, to) {

    this.url.searchParams.set('from', from.toISOString()); // url = https://google.com + ?from=decodeURIComponent(...)
    this.url.searchParams.set('to', to.toISOString());
    // возвращает результат функции response.json();
    return await fetchJson(this.url);
  }

  setNewRange(from, to) {
    this.range.from = from;
    this.range.to = to;
  }

  getColumnBody(data) {
    // в этой части кода значения, которые не входят в промежуточный вариант шаблона проверки
    const maxValue = Math.max(...Object.values(data)); // проделываем Math.max со всеси значения массива

    return Object.entries(data).map(([key, value]) => {
      const scale = this.chartHeight / maxValue;
      const percent = (value / maxValue * 100).toFixed(0);
      // tooltip - значение, которое появляется при наведении мышки на столбец графика
      // ОЧЕНЬ ДЛИННЫЙ tooltip!!!!!
      const tooltip = `<span>
        <small>${key.toLocaleString('default', {dateStyle: 'medium'})}</small>
        <br>
        <strong>${percent}%</strong>
      </span>`;

      return `<div style="--value: ${Math.floor(value * scale)}" data-tooltip="${tooltip}"></div>`;
    }).join('');
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    // reduce(_, _) - возвращает одно значение, в данном случае объект
    // второй аргумент функции  = начальлное значение accum|накопителя
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  async update(from, to) {
    this.element.classList.add('column-chart_loading');

    const data = await this.loadData(from, to); // возвращает объект Promis с данными в виде json объекта
    // проверить что вернулось объект или массив??????????????
    this.setNewRange(from, to);
    // если данные существуют и длинна этих данных не нулевая
    if (data && Object.values(data).length) {
      this.subElements.header.textContent = this.getHeaderValue(data); // получаем TotalValue
      this.subElements.body.innerHTML = this.getColumnBody(data);

      this.element.classList.remove('column-chart_loading');
    }

    return data;
  }

  destroy() {
    this.element.remove();
  }
}
