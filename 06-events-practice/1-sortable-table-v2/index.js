export default class SortableTable {

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {

    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = true;

    // console.error(`this.sorted[id] = ${this.sorted.id}, this.sorted.order = ${this.sorted.order}`);
    this.render();
  }

  render () {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.sort(this.sorted.id, this.sorted.order);

    this.setOnclickListener();
  }

  getTemplate () {

    return `<div data-element="productsContainer" class="products-list__container">
              <div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                  ${this.getTableHeader()}
                </div>
                <div data-element="body" class="sortable-table__body">
                  ${this.getTableBody()}
                </div>
              </div>
            </div>`;
  }

  getTableHeader (field, param) {

    return this.headersConfig.map(item => {return this.getRowHeader(item.id, item.title, item.sortable, field, param);}).join('\n');
  }

  getRowHeader (id, title, sortable, field, param="asc") {

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

  getTableBody (data = this.data) {

    return data.map(item => {return this.getTableRow(item);}).join('\n');
  }

  getTableRow (item) {

    const cells = this.headersConfig.map(({id, template}) => {return {id, template};});

    return `<a href="${item.id}" class="sortable-table__row">
              ${cells.map(({id, template}) => {return template ? template(item[id]) : this.getTableCell(item[id]);
              }).join('\n')}
            </a>`;
  }

  getTableCell (data) {

    return `<div class="sortable-table__cell">${data}</div>`;
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


  sort (field, param) {
    const mode = {
      'asc': 1,
      'desc': -1
    }

    this.subElements.header.innerHTML = this.getTableHeader(field, param);
    const value = this.headersConfig.find(item => item.id === field);

    switch(value["sortType"]) {
      case 'string': {

        this.subElements.body.innerHTML = this.getTableBody(this.data.slice().sort((a, b) => mode[param] * a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper'})));
        break;
      }
      case 'number': {

        this.subElements.body.innerHTML = this.getTableBody(this.data.slice().sort((a,b) => mode[param] * (a[field] - b[field]) ) );
        break;
      }
    }
  }

  onclickHandler = (event) => {

    let clickTarget = event.target;

    if(!clickTarget.dataset.id) {

      if(!clickTarget.closest('div').dataset.id) {
        return;
      }
      clickTarget = clickTarget.closest('div');
    }

    let order = clickTarget.dataset.order;

    if(clickTarget.querySelector('[data-element="arrow"]')) {
      if(order === 'asc') {
        order = 'desc';
      } else {
        order = 'asc';
      }
    }

    this.sort(clickTarget.dataset.id, order);
  }

  setOnclickListener() {

    const eventElem = this.element.querySelector('div[data-element="header"]');
    eventElem.addEventListener("click",this.onclickHandler);
  }



  destroy () {
    // this.remove();
    this.element = null;
    this.subElements = {};

  }



}
