/**
 * @factory RepositorySorting
 */
function RepositorySortingFactory(EventEmitter, utils) {
	function RepositorySorting() {
		this.$$sorting = [];
	}

	RepositorySorting.create = function(sorting) {
		var instance = new RepositorySorting();
		instance.setState(sorting);

		return instance;
	};

	var directions = {
		ASC: 'asc',
		DESC: 'desc'
	};

	var prototype = {
		setState: addSortingList,
		sort: sort,
		invert: invert,
		remove: removeSorting,
		reset: reset,
		toJSON: toJSON,
		toArray: toArray,
		getSorting: getSorting,
		hasSorting: hasSorting,

		directions: directions
	};

	utils.merge(prototype, directions);
	utils.merge(RepositorySorting, directions);

	function toJSON() {
		return this.$$sorting.slice();
	}

	function toArray() {
		return this.$$sorting.map(function(sort) {
			return [sort.name, sort.direction];
		});
	}

	function addSorting(sorting) {
		if (Array.isArray(sorting)) {
			sorting = {
				name: sorting[0],
				direction: sorting[1]
			};
		}

		if (typeof sorting === 'object' && sorting !== null && 'name' in sorting && 'direction' in sorting) {
			if (this.hasSorting(sorting.name)) {
				this.invert(sorting.name);
			} else {
				this.$$sorting.push(sorting);
			}
		}

	}

	function sort(name, direction) {
		if (arguments.length === 1) {
			direction = directions.ASC;
		}

		addSorting.call(this, [name, direction]);
		this.emit('update', this);
	}

	function invert(name) {
		this.$$sorting.some(function(sort) {
			if (sort.name === name) {
				sort.direction = sort.direction === directions.ASC ? directions.DESC : directions.ASC;
				return true;
			}
		});
	}

	function removeSorting(name) {
		if (!name) return;

		this.$$sorting = this.$$sorting.filter(function(sort) {
			return sort.name !== name;
		});
	}

	function getSorting(name) {
		var found = null;

		this.$$sorting.some(function(sort) {
			if (sort.name === name) {
				found = sort;
				return true;
			}
		});

		return found;
	}

	function hasSorting(name) {
		return this.$$sorting.some(function(sort) {
			return sort.name === name;
		});
	}

	function reset() {
		this.$$sorting = [];
	}

	function addSortingList(sortingList) {
		if (!Array.isArray(sortingList)) return;

		sortingList.forEach(addSorting, this);
	}

	utils.inherits(RepositorySorting, EventEmitter, prototype);

	return RepositorySorting;
}
