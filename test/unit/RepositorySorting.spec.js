describe('RepositorySorting', function() {
	var instance;

	beforeEach(module('repository'));
	beforeEach(inject(function(RepositorySorting) {
		instance = new RepositorySorting();
	}));

	describe('::ASC & ::DESC - directions', function() {
		it('should have ASC and DESC static values and instance values to use as sorting direction', inject(function(RepositorySorting) {
			expect(RepositorySorting.ASC).toBe('asc');
			expect(RepositorySorting.DESC).toBe('desc');

			expect(instance.ASC).toBe('asc');
			expect(instance.DESC).toBe('desc');

			expect(instance.directions.ASC).toBe('asc');
			expect(instance.directions.DESC).toBe('desc');
		}));
	});

	describe('::create', function() {
		it('should create an instance and add sorting to it', inject(function(RepositorySorting) {
			var ageSorting = {
				name: 'age',
				direction: RepositorySorting.ASC
			};

			var sorting = RepositorySorting.create([ageSorting]);

			expect(sorting.toJSON()).toEqual([ageSorting]);
		}));
	});

	describe('#constructor', function() {
		it('should be a subclass of EventEmitter', inject(function(EventEmitter) {
			expect(instance instanceof EventEmitter).toBe(true);
		}));
	});

	describe('#add(Array sorting)', function() {
		it('should silently refuse to add invalid sorting values', function() {
			instance.setState({});
			instance.setState(null);
			instance.setState();
			instance.setState(0);
			instance.setState(false);
			instance.setState([]);
			instance.setState([null]);
			instance.setState([{}]);
			instance.setState([{
				name: ''
			}]);

			expect(instance.$$sorting.length).toBe(0);
		});

		it('should add sorting objects with name and direction', function() {
			var sorting = [{
				name: 'name',
				direction: instance.ASC
			}];

			instance.setState(sorting);

			expect(instance.$$sorting.length).toBe(1);
			expect(instance.$$sorting[0].name).toBe('name');
			expect(instance.$$sorting[0].direction).toBe(instance.ASC);
		});

		it('should add sorting values from an array of ordered pairs with name and direction', function() {
			var sorting = ['name', instance.DESC];

			instance.setState([sorting]);

			expect(instance.$$sorting.length).toBe(1);
			expect(instance.$$sorting[0].name).toBe('name');
			expect(instance.$$sorting[0].direction).toBe(instance.DESC);
		});
	});

	describe('#sort(String name, String direction)', function() {
		it('should add a sorting rule and emit the "update" event', function() {
			var spy = jasmine.createSpy('update');

			instance.on('update', spy);
			instance.sort('name', instance.ASC);

			expect(instance.$$sorting.length).toBe(1);
			expect(instance.$$sorting[0].name).toBe('name');
			expect(instance.$$sorting[0].direction).toBe(instance.ASC);

			expect(spy.calls.count()).toBe(1);
		});

		it('should add ASC as default direction', function() {
			instance.sort('name');

			expect(instance.$$sorting.length).toBe(1);
			expect(instance.$$sorting[0].name).toBe('name');
			expect(instance.$$sorting[0].direction).toBe(instance.ASC);
		});

		it('should only invert the direction if the direction is not provided and the filter exists', function() {
			instance.sort('name');

			expect(instance.$$sorting.length).toBe(1);
			expect(instance.$$sorting[0].name).toBe('name');
			expect(instance.$$sorting[0].direction).toBe(instance.ASC);

			instance.sort('name');

			expect(instance.$$sorting.length).toBe(1);
			expect(instance.$$sorting[0].name).toBe('name');
			expect(instance.$$sorting[0].direction).toBe(instance.DESC);

			instance.sort('name');

			expect(instance.$$sorting.length).toBe(1);
			expect(instance.$$sorting[0].name).toBe('name');
			expect(instance.$$sorting[0].direction).toBe(instance.ASC);
		});
	});

	describe('#invert(String name)', function() {
		it('should invert the sorting direction if the sorting rule exists', function() {
			var sorting;
			instance.sort('name', instance.ASC);

			instance.invert('name');
			sorting = instance.getSorting('name');
			expect(sorting.direction).toBe(instance.DESC);

			instance.invert('name');
			sorting = instance.getSorting('name');
			expect(sorting.direction).toBe(instance.ASC);
		});
	});

	describe('#remove(String name)', function() {
		it('should remove a sorting rule by name', function() {
			instance.sort('age', instance.ASC);

			var ageSorting = instance.getSorting('age');
			expect(ageSorting.name).toBe('age');
			expect(ageSorting.direction).toBe(instance.ASC);

			instance.remove('age');

			expect(instance.getSorting('age')).toBe(null);
		});
	});

	describe('#reset()', function() {
		it('should clear all the sorting rules', function() {
			instance.sort('name', instance.ASC);
			expect(instance.$$sorting.length).toBe(1);

			instance.reset();
			expect(instance.$$sorting.length).toBe(0);
		});
	});

	// http://www.ecma-international.org/ecma-262/5.1/#sec-15.12.3
	describe('#toJSON()', function() {
		it('should convert the filters into an array of object literals with name, operator and value', function() {
			instance.sort('name', instance.ASC);

			var json = instance.toJSON();

			expect(json).not.toBe(undefined);
			expect(json[0]).toEqual({
				name: 'name',
				direction: instance.ASC
			});
		});
	});

	describe('#toArray()', function() {
		it('should convert the filters into an array where each item is a triplet name/operator/value', function() {
			instance.sort('name');
			instance.sort('age', instance.DESC);

			var sorting = instance.toArray();

			expect(sorting.length).toBe(2);

			var nameSorting = sorting[0],
				ageSorting = sorting[1];

			expect(nameSorting[0]).toBe('name');
			expect(nameSorting[1]).toBe(instance.ASC);

			expect(ageSorting[0]).toBe('age');
			expect(ageSorting[1]).toBe(instance.DESC);
		});
	});

	describe('#getSorting(String name)', function() {
		it('should return a sorting rule by name if it exists, or null instead', function() {
			expect(instance.getSorting('name')).toBe(null);
			instance.sort('name');

			expect(instance.getSorting('name')).toEqual({
				name: 'name',
				direction: instance.ASC
			});
		});
	});

	describe('#hasSorting(String name)', function() {
		it('should return whether the sorting rule exists', function() {
			expect(instance.hasSorting('name')).toBe(false);
			instance.sort('name');
			expect(instance.hasSorting('name')).toBe(true);
			instance.remove('name');
			expect(instance.hasSorting('name')).toBe(false);
		});
	});

});
