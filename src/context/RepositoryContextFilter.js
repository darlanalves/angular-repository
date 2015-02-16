/**
 * @factory RepositoryContextFilter
 */
function RepositoryContextFilterFactory(EventEmitter, utils) {
	function RepositoryContextFilter() {
		EventEmitter.call(this);
		this.$$filters = [];
	}

	RepositoryContextFilter.create = function(filters) {
		var instance = new RepositoryContextFilter();
		instance.import(filters);

		return instance;
	};

	var operators = {
		EQ: '=',
		NE: '!=',
		LT: '<',
		LTE: '<=',
		GT: '>',
		GTE: '>=',
		IN: 'in'
	};

	var prototype = {
		import: addFilterList,
		toJSON: toJSON,
		toArray: toArray,
		where: where,
		getFilter: getFilter,
		remove: removeFilter,
		reset: reset,

		operators: operators
	};

	utils.merge(prototype, operators);
	utils.merge(RepositoryContextFilter, operators);

	function toJSON() {
		return this.$$filters.slice();
	}

	function toArray() {
		return this.$$filters.map(function(filter) {
			return [filter.name, filter.operator, filter.value];
		});
	}

	function addFilter(filter) {
		if (Array.isArray(filter)) {
			filter = {
				name: filter[0],
				operator: filter[1],
				value: filter[2]
			};
		}

		if (typeof filter === 'object' && filter !== null && 'name' in filter && 'value' in filter && 'operator' in filter) {
			this.$$filters.push(filter);
		}
	}

	function addFilterList(filters) {
		if (!Array.isArray(filters)) return;

		filters.forEach(addFilter, this);
	}

	function where(name, operator, value) {
		if (arguments.length === 2) {
			value = operator;
			operator = operators.EQ;
		}

		addFilter.call(this, [name, operator, value]);
		this.emit('update', this);
	}

	function getFilter(name) {
		var found;

		this.$$filters.some(function(filter) {
			if (filter.name === name) {
				found = filter;
				return true;
			}
		});

		return found;
	}

	function reset() {
		this.$$filters = [];
	}

	function removeFilter(name) {
		if (!name) return;

		this.$$filters = this.$$filters.filter(function(filter) {
			return filter.name !== name;
		});
	}

	utils.inherits(RepositoryContextFilter, EventEmitter, prototype);

	return RepositoryContextFilter;
}