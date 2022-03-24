export default class SortableTable {

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {

    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = true;

    this.render();
  }

  render () {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.subElements.body.innerHTML = this.getBodyTable(this.sortedData());
    this.setOnclickListener();
  }

  getTemplate () {

    return `<div data-element="productsContainer" class="products-list__container">
              <div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                  ${this.getHeaderTable()}
                </div>
                <div data-element="body" class="sortable-table__body">
                </div>
              </div>
            </div>`;
  }

  getHeaderTable (field = this.sorted.id, param = this.sorted.order) {

    return this.headersConfig.map(item => {return this.getHeaderRow(item.id, item.title, item.sortable, field, param);}).join('\n');
  }

  getHeaderRow (id, title, sortable, field, param) {

    if (field === id) {
      return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${param}">
                <span>${title}</span>
                <span data-element="arrow" class="sortable-table__sort-arrow">
                  <span class="sort-arrow"></span>
                </span>
              </div>`;
    }

    return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${param}">
              <span>${title}</span>
            </div>`;
  }

  getBodyTable (data) {
    return data.map(item => {return this.getBodyRow(item);}).join('\n');
  }

  getBodyRow (item) {

    const cells = this.headersConfig.map(({id, template}) => {return {id, template};});

    return `<a href="${item.id}" class="sortable-table__row">
              ${cells.map(({id, template}) => {return template ? template(item[id]) : this.getTableCell(item[id]);
              }).join('\n')}
            </a>`;
  }

  getTableCell (data) {

    return `<div class="sortable-table__cell">${data}</div>`;
  }

  sortedData (field = this.sorted.id, param = this.sorted.order) {

    const mode = {
      'asc': 1,
      'desc': -1
    }
    const value = this.headersConfig.find(item => item.id === field);
    switch(value["sortType"]) {
      case 'string': {
        return this.data.slice().sort((a, b) => mode[param] * a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper'}));
      }
      case 'number': {
        return this.data.slice().sort((a,b) => mode[param] * (a[field] - b[field]) );
      }
    }
  }

  getSubElements () {

    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] =  subElement;
    }

    return result;
  }

  onclickHandler = (event) => {
    const clickTarget = event.target.closest('[data-sortable="true"]');
    const toggleOrder = (order) => {
      const orders ={
        asc: 'desc',
        desc: 'asc'
        };

      return orders[order];
    };

    if(clickTarget) {
      const {id, order} = clickTarget.dataset;
      const newOrder = toggleOrder(order);
      const sortedData = this.sortedData(id, newOrder);
      const arrow = clickTarget.querySelector('.sortable-table__sort-arrow');
      clickTarget.dataset.order = newOrder;

      if(!arrow) {

        clickTarget.append(this.subElements.arrow);
      }

      this.subElements.body.innerHTML = this.getBodyTable(sortedData);
    }
  }

  setOnclickListener() {

    const eventElem = this.element.querySelector('div[data-element="header"]');
    eventElem.addEventListener("pointerdown",this.onclickHandler);
  }

  destroy () {
    // this.remove();
    this.element = null;
    this.subElements = {};

  }
}
