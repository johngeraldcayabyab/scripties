class Table {
    constructor(table, config) {
        this.instantiated = false;
        this.table = table;
        this.url = config.url;
        this.columns = config.columns;
        this.pagination = config.pagination;
        this.filter = config.filter;
        this.columnAlignment = config.columnAlignment ? config.columnAlignment : 'text-end'

        this.createTable();
        this.fetchThenRenderData();
    }

    fetchThenRenderData() {
        get(this.getUrl()).then((response) => {
            this.meta = response.meta;
            this.links = response.links;

            let rows = [];
            response.data.forEach((data) => {
                let tr = document.createElement('tr');
                tr.classList.add(...[this.columnAlignment, 'table-row']);
                this.columns.forEach((column) => {
                    let td = document.createElement('td');
                    if (!column.render) {
                        td.append(data[column.field]);
                    } else {
                        let self = this;
                        td.append(column.render(data.id, self));
                    }
                    tr.append(td);
                });
                rows.push(tr);
            });
            let tBody = document.querySelector(`${this.table} tbody`);
            tBody.innerHTML = '';
            tBody.append(...rows);
        }).then(() => {
            if (this.pagination) {
                this.createPagination();
            }
            if (!this.instantiated) {
                this.createFilter();
            }
            this.instantiated = true;
        });
    }

    createTable() {
        let table = document.querySelector(this.table);
        table.setAttribute('style', 'font-size: 13px;')
        let tHead = this.createThead();
        let tBody = this.createTBody();
        tBody.innerHTML = '';
        table.append(tHead);
        table.append(tBody);
    }

    createThead() {
        let tHead = document.createElement('thead');
        let tr = document.createElement('tr');
        let rows = [];
        this.columns.forEach((column) => {
            let row = document.createElement('th');
            row.classList.add(this.columnAlignment);
            row.setAttribute('scope', 'col');
            row.append(column.label);
            rows.push(row);
        });
        tr.append(...rows);
        tHead.append(tr);
        return tHead;
    }

    createTBody() {
        return document.createElement('tbody');
    }

    getUrl() {
        return this.url;
    }

    setUrl(url) {
        this.url = url;
    }

    updateUrlParam(param, value) {
        let href = new URL(this.url);
        href.searchParams.set(param, value);
        this.url = href.toString();
    }

    /**
     * Pagination
     */
    createPagination() {
        let nav = document.querySelector(`${this.pagination}`);
        let unorderedList = document.createElement('ul');
        unorderedList.classList.add(...['pagination', 'justify-content-end', 'pagination-sm']);
        nav.innerHTML = '';
        unorderedList.append(...this.createLinks());
        nav.append(unorderedList);
    }

    createLinks() {
        let links = [];
        let paginationInput = document.createElement('input');
        paginationInput.classList.add(...['form-control', 'form-control-sm']);
        paginationInput.setAttribute('type', 'number');
        paginationInput.setAttribute('placeholder', '#');
        paginationInput.setAttribute('maxlength', '4');
        paginationInput.setAttribute('min', this.meta.from);
        paginationInput.setAttribute('max', this.meta.last_page);
        this.meta.links.map((link) => {
            let list = document.createElement('li');
            list.classList.add('page-item');

            let anchor = document.createElement('a');
            anchor.classList.add('page-link');
            anchor.innerHTML = link.label;
            anchor.setAttribute('href', link.url);

            if (link.active) {
                list.classList.add('active');
            }

            if (!link.url) {
                list.classList.add('disabled');
                anchor.setAttribute('href', '#');
            }

            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.setUrl(e.target.getAttribute('href'));
                this.fetchThenRenderData();
            });

            list.append(anchor);
            links.push(list);
        });

        paginationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                let paginationInputValue = paginationInput.value;
                if (paginationInputValue > this.meta.last_page || paginationInputValue < 1) {
                    alert(`Page ${paginationInputValue} does not exist`);
                } else {
                    this.updateUrlParam('page', paginationInputValue);
                    this.fetchThenRenderData();
                }
            }
        });

        let paginationInputList = document.createElement('li');
        paginationInputList.append(paginationInput);
        links.push(paginationInputList);

        return links;
    }


    /**
     * Filter
     */
    createFilter() {
        let isFilter = false;
        this.columns.forEach((column) => {
            if (column.filter) {
                isFilter = true;
            }
        });

        if (!isFilter) {
            return null;
        }

        let searchAndResetButtonContainer = document.createElement('div');
        searchAndResetButtonContainer.classList.add(...['col-2', 'offset-10', 'text-end', 'mb-3']);
        searchAndResetButtonContainer.append(this.createSearchAndResetButton());
        let filters = this.columns.map((column) => {
            if (column.filter) {
                if (column.filter.type === 'select') {
                    column = this.createSelectFilter(column);
                } else if (column.filter.type === 'text_input') {
                    column = this.createTextFilter(column);
                } else if (column.filter.type === 'number_filter') {
                    column = this.createNumberFilter(column);
                }
            } else {
                column = '';
            }
            return column;
        });

        let table = document.querySelector(this.table);
        table.insertAdjacentElement('beforebegin', searchAndResetButtonContainer);

        let row = document.createElement('tr');
        row.classList.add('bg-light');

        filters = filters.map((filter) => {
            let th = document.createElement('th');
            th.append(filter);
            return th;
        });


        row.append(...filters);
        let tHead = document.querySelector(`${this.table} thead`);
        tHead.append(row);
    }

    createSelectFilter(column) {
        let select = document.createElement('select');
        select.classList.add(...['form-select', 'form-select-sm']);
        select.setAttribute('name', column.field);
        let selectOptions = [];
        column.filter.options.forEach((option) => {
            let optionElement = document.createElement('option');
            optionElement.setAttribute('value', option.value);
            if (option.selected) {
                optionElement.setAttribute('selected', "selected");
            }
            optionElement.innerHTML = option.label;
            selectOptions.push(optionElement);
        });
        select.append(...selectOptions);
        return select;
    }

    createTextFilter(column) {
        let input = document.createElement('input');
        input.classList.add(...['form-control', 'form-control-sm']);
        input.setAttribute('name', column.field);
        input.setAttribute('type', 'text');
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('placeholder', column.filter.placeholder ? column.filter.placeholder : column.label);
        if (column.filter.value) {
            input.setAttribute('value', column.filter.value);
        }
        return input;
    }

    createNumberFilter(column) {
        let input = document.createElement('input');
        input.classList.add(...['form-control', 'form-control-sm']);
        input.setAttribute('name', column.field);
        input.setAttribute('type', 'number');
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('placeholder', column.filter.placeholder ? column.filter.placeholder : column.field);
        if (column.filter.value) {
            input.setAttribute('value', column.filter.value);
        }
        return input;
    }

    createSearchAndResetButton() {
        let buttonGroup = document.createElement('div');
        buttonGroup.classList.add('btn-group');
        buttonGroup.setAttribute('role', 'group');
        let resetButton = document.createElement('input');
        resetButton.classList.add(...['btn', 'btn-sm', 'btn-outline-secondary']);
        resetButton.setAttribute('type', 'reset');
        resetButton.setAttribute('value', 'Reset');
        let searchButton = document.createElement('button');
        searchButton.classList.add(...['btn', 'btn-sm', 'btn-outline-primary']);
        searchButton.setAttribute('type', 'button');
        let buttonSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        buttonSvg.classList.add(...['bi', 'bi-search']);
        buttonSvg.setAttribute('width', '20px');
        buttonSvg.setAttribute('height', '20px');
        buttonSvg.setAttribute('fill', 'currentColor');
        buttonSvg.setAttribute('viewBox', '0 0 16 16');
        buttonSvg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z');
        buttonSvg.append(path);
        searchButton.append(buttonSvg);
        buttonGroup.append(resetButton);
        buttonGroup.append(searchButton);
        return buttonGroup;
    }
}