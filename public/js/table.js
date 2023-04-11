class Table {
    constructor(table, config = {}) {
        this.originalUrl = config.url;
        this.instantiated = false;
        this.table = table;
        this.url = config.url;
        this.columns = config.columns;
        this.pagination = config.pagination;
        this.paginationCenter = config.paginationCenter;
        this.filter = config.filter;
        this.columnAlignment = config.columnAlignment ? config.columnAlignment : 'text-end';
        this.row = config.row;
        this.tBodyRows = [];
        this.customButtons = config.customButtons;
        this.getAndSetMultipleParamsFromUrlString(config.url);
        this.createTable();
        if (!config.hasOwnProperty('initialRenderFalse')) {
            this.fetchThenRenderData();
        }
    }

    getAndSetMultipleParamsFromUrlString(url) {
        if (this.hasQueryParams(url)) {
            const params = this.getTheQueryParams(url);
            this.setMultipleParams(params);
        }
    }

    hasQueryParams(url) {
        return url.includes('?');
    }

    getTheQueryParams(url) {
        return Object.fromEntries(new URL(url).searchParams.entries());
    }

    setMultipleParams(params) {
        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                this.setUrlParam(key, params[key]);
            }
        }
    }

    getTbody() {
        return document.querySelector(`${this.table} tbody`);
    }

    fetchThenRenderData() {
        get(this.getUrl()).then((response) => {
            this.meta = response.meta;
            this.links = response.links;

            let rows = [];
            response.data.forEach((data) => {
                let row = this.generateRow(data);
                rows.push(row);
            });
            let tBody = this.getTbody();
            tBody.innerHTML = '';
            tBody.append(...rows);
            this.tBodyRows = rows;
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

    appendRow(data) {
        let tBody = this.getTbody();
        const row = this.generateRow(data);
        tBody.append(row);
    }

    generateRow(data) {
        let row = document.createElement('tr');
        row.classList.add(...[this.columnAlignment, 'table-row']);
        this.columns.forEach((column) => {
            let td = document.createElement('td');
            if (column.hasOwnProperty('title')) {
                if (typeof column.title === 'function') {
                    td.setAttribute('title', column.title(data, self));
                } else {
                    td.setAttribute('title', column.title);
                }
            }
            /**
             * Dictates the rendered child
             */
            if (!column.render) {
                td.append(data[column.field]);
            } else {
                let self = this;
                const rendered = column.render(data, self);
                if (typeof (rendered) === 'string') {
                    td.insertAdjacentHTML('beforeend', rendered);
                } else {
                    td.append(rendered);
                }
            }
            row.append(td);
        });
        if (this.row) {
            row = this.row(data, row);
        }
        return row;
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

    setUrlParam(param, value) {
        let isValueSet = value.trim().length;
        if (this.isUrlParamExist(param)) {
            if (isValueSet) {
                this.updateUrlParam(param, value);
            } else {
                this.deleteUrlParam(param);
            }
        } else {
            if (isValueSet) {
                this.addUrlParam(param, value);
            }
        }
    }

    isUrlParamExist(param) {
        let url = new URL(this.url);
        return !!url.searchParams.get(param);
    }

    updateUrlParam(param, value) {
        let url = new URL(this.url);
        url.searchParams.set(param, value);
        this.url = url.toString();
    }

    addUrlParam(param, value) {
        let url = new URL(this.url);
        url.searchParams.append(param, value);
        this.url = url.toString();
    }

    deleteUrlParam(param) {
        let url = new URL(this.url);
        url.searchParams.delete(param);
        this.url = url.toString();
    }

    /**
     * Pagination
     */
    createPagination() {
        let nav = document.querySelector(`${this.pagination}`);
        let unorderedList = document.createElement('ul');
        unorderedList.classList.add(...['pagination', this.paginationCenter ? 'justify-content-center' : 'justify-content-end', 'pagination-sm']);
        nav.innerHTML = '';
        unorderedList.append(...this.createLinks());
        nav.append(unorderedList);
    }

    createLinks() {
        let paginationInput = document.createElement('input');
        paginationInput.classList.add(...['form-control', 'form-control-sm']);
        paginationInput.setAttribute('type', 'number');
        paginationInput.setAttribute('placeholder', '#');
        paginationInput.setAttribute('maxlength', '4');
        paginationInput.setAttribute('min', this.meta.from);
        paginationInput.setAttribute('max', this.meta.last_page);

        let links = this.createBackwardCompatibleLinks();

        if (links.length > 0) {
            links = links.map((link) => {
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
                    this.getAndSetMultipleParamsFromUrlString(e.target.getAttribute('href'));
                    this.getFieldValuesThenFetchData();
                });

                list.append(anchor);
                return list;
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
        }

        return links;
    }

    createBackwardCompatibleLinks() {
        let links = this.meta.links;
        if (!links) {
            const LAST_PAGE = this.meta.last_page;
            const CURRENT_PAGE = this.meta.current_page;
            for (let i = 0; i < LAST_PAGE; i++) {
                const PAGE = i + 1;
                let thisUrl = `${this.url}?page=${PAGE}`;
                if (this.url.includes('page')) {
                    let url = new URL(thisUrl);
                    url.searchParams.set('page', PAGE);
                    thisUrl = url.toString();
                }
                links.push({
                    "url": thisUrl, "label": PAGE, "active": PAGE === CURRENT_PAGE
                });
            }
            links = [{
                "url": this.links.prev, "label": "&laquo;", "active": false
            }, ...links, {
                "url": this.links.next, "label": "&raquo;", "active": false
            }]
        }
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
        searchAndResetButtonContainer.append(this.createFilterAndResetButton());
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
        row.classList.add(...['bg-light', 'filter-row', 'd-none']);

        filters = filters.map((filter) => {
            let th = document.createElement('th');
            th.append(filter);
            return th;
        });

        row.append(...filters);
        let tHead = document.querySelector(`${this.table} thead`);
        tHead.append(row);

        let filterFields = document.querySelectorAll('.filter-fields');
        filterFields.forEach(field => {
            if (field.tagName === 'INPUT') {
                field.addEventListener('keyup', (e) => {
                    if (e.key === 'Enter') {
                        this.resetPaginationOnSearch();
                        this.getFieldValuesThenFetchData();
                    }
                });
            } else if (field.tagName === 'SELECT') {
                field.addEventListener('change', (e) => {
                    this.resetPaginationOnSearch();
                    this.getFieldValuesThenFetchData();
                });
            }
        });
        this.toggleFilterFieldsRow();
        this.resetFiltersOnClick();
    }

    resetPaginationOnSearch() {
        this.updateUrlParam('page', 1);
        // this.setUrlParam('page', 1);
    }

    createSelectFilter(column) {
        let select = document.createElement('select');
        select.classList.add(...['form-select', 'form-select-sm', 'filter-fields']);
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
        input.classList.add(...['form-control', 'form-control-sm', 'filter-fields']);
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
        input.classList.add(...['form-control', 'form-control-sm', 'filter-fields']);
        input.setAttribute('name', column.field);
        input.setAttribute('type', 'number');
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('placeholder', column.filter.placeholder ? column.filter.placeholder : column.field);
        if (column.filter.value) {
            input.setAttribute('value', column.filter.value);
        }
        return input;
    }

    createFilterAndResetButton() {
        let buttonGroup = document.createElement('div');
        buttonGroup.classList.add('btn-group');
        buttonGroup.setAttribute('role', 'group');
        let resetButton = document.createElement('input');
        resetButton.classList.add(...['btn', 'btn-sm', 'btn-outline-secondary', 'filter-reset']);
        resetButton.setAttribute('type', 'reset');
        resetButton.setAttribute('value', 'Reset');
        let searchButton = document.createElement('button');
        searchButton.classList.add(...['btn', 'btn-sm', 'btn-outline-primary', 'filter-button']);
        searchButton.setAttribute('type', 'button');
        let buttonSvg = createSVG(['bi', 'bi-search']);
        searchButton.append(buttonSvg);
        const customButtons = this.createCustomButtons();
        customButtons.forEach((customButton) => {
            buttonGroup.append(customButton);
        });
        buttonGroup.append(resetButton);
        buttonGroup.append(searchButton);
        return buttonGroup;
    }

    createCustomButtons() {
        if (this.customButtons) {
            return this.customButtons.map((button) => {
                let customButton = document.createElement('input');
                customButton.classList.add(...['btn', 'btn-sm', 'btn-outline-secondary', 'filter-reset']);
                customButton.setAttribute('type', 'button');
                customButton.setAttribute('value', button.label);
                return customButton;
            });
        }
        return [];
    }

    toggleFilterFieldsRow() {
        let filterButton = document.querySelector('.filter-button');
        filterButton.addEventListener('click', (e) => {
            let filterRow = document.querySelector('.filter-row');
            if (filterRow.classList.contains('d-none')) {
                filterRow.classList.remove('d-none');
            } else {
                let fieldValues = this.getFieldValues();
                if (!this.isFilterFieldsHasValues(fieldValues)) {
                    this.resetPaginationOnSearch();
                    filterRow.classList.add('d-none');
                }
            }
            this.getFieldValuesThenFetchData();
        });
    }

    isFilterFieldsHasValues(fields) {
        let hasValues = false;
        fields.forEach((field) => {
            if (field.value.trim().length) {
                hasValues = true;
            }
        });
        return hasValues;
    }

    getFieldValuesThenFetchData() {
        let fieldValues = this.getFieldValues();
        fieldValues.forEach((field) => {
            this.setUrlParam(field.name, field.value);
        });
        this.fetchThenRenderData();
    }

    getFieldValues() {
        let filterFields = this.getFilterFields();
        let fieldValues = [];
        filterFields.forEach((field) => {
            fieldValues.push({name: field.getAttribute('name'), value: field.value});
        });
        return fieldValues;
    }

    resetFiltersOnClick() {
        let filterReset = document.querySelector('.filter-reset');
        filterReset.addEventListener('click', (e) => {
            this.resetFilters();
        });
    }

    resetFilters() {
        this.setUrl(this.originalUrl);
        let filterFields = this.getFilterFields();
        filterFields.forEach((filterField) => {
            filterField.value = '';
        });
        this.resetPaginationOnSearch();
        this.getFieldValuesThenFetchData();
    }

    getFilterFields() {
        return document.querySelectorAll('.filter-fields');
    }

    renderDeleteButton(data, table, route) {
        let deleteButton = document.createElement('button');
        deleteButton.setAttribute('type', 'button');
        deleteButton.classList.add(...['btn', 'btn-danger', 'btn-sm', 'btn-delete']);
        deleteButton.innerHTML = 'Del';
        deleteButton.id = data.id;
        deleteButton.addEventListener('click', () => {
            if (!confirm('Are you sure you want to delete this record?')) {
                return true;
            }
            let url = route;
            url = url.replace(':id', data.id);
            destroy(url).then(() => {
                table.fetchThenRenderData();
            });
        });
        return deleteButton;
    }

    /**
     * Currently does not reset filter
     */
    clearTable() {
        let tBody = document.querySelector(`${this.table} tbody`);
        if (tBody) {
            tBody.innerHTML = '';
        }
        let nav = document.querySelector(`${this.pagination}`);
        if (nav) {
            nav.innerHTML = '';
        }
    }
}

function createSVG(classList) {
    let d;
    if (classList[1] === 'bi-search') {
        d = 'M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z';
    } else if (classList[1] === 'bi-chevron-up') {
        d = 'M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z';
    } else if (classList[1] === 'bi-chevron-down') {
        d = 'M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z';
    }
    let buttonSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    buttonSvg.classList.add(...classList);
    buttonSvg.setAttribute('width', '20px');
    buttonSvg.setAttribute('height', '20px');
    buttonSvg.setAttribute('fill', 'currentColor');
    buttonSvg.setAttribute('viewBox', '0 0 16 16');
    buttonSvg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    buttonSvg.append(path);
    return buttonSvg;
}
