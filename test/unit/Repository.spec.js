describe('Repository', function() {

	beforeEach(module('repository'));

	var instance;

	beforeEach(inject(function(DataProviderInterface, RepositoryConfig, Repository) {
		var DataProvider = DataProviderInterface.extend();

		var config = new RepositoryConfig({
			name: 'resource',
			dataProvider: new DataProvider()
		});

		instance = new Repository(config);
	}));

	describe('::extend(Object [prototype])', function() {
		it('should be a static method to extend the repository class', inject(function(Repository, RepositoryConfig, DataProviderInterface) {
			expect(typeof Repository.extend).toBe('function');

			var config = new RepositoryConfig({
				name: 'static-test',
				dataProvider: new DataProviderInterface()
			});

			var Dummy = Repository.extend({
				isDummy: true
			});

			var dummy = new Dummy(config);
			expect(dummy instanceof Repository).toBe(true);
			expect(dummy.isDummy).toBe(true);
		}));
	});

	describe('#constructor(Object config)', function() {
		it('should NOT continue without a valid config', inject(function(Repository) {
			function invalidConfig() {
				return new Repository(null);
			}

			expect(invalidConfig).toThrow();
		}));

		it('should save the config into .config property', inject(function(RepositoryConfig) {
			expect(instance.config).not.toBe(undefined);
			expect(instance.config instanceof RepositoryConfig).toBe(true);
		}));
	});

	describe('#createContext(String name)', function() {
		it('should create a Repository Context with a given name', inject(function(RepositoryContext) {
			var context = instance.createContext('context');
			expect(context).not.toBeFalsy();
			expect(context instanceof RepositoryContext).toBe(true);
		}));

		it('should NOT create a new context if one with the same name already exists. Return it instead', inject(function(RepositoryContext) {
			var context = instance.createContext('my-context');
			expect(context instanceof RepositoryContext).toBe(true);

			var otherContext = instance.createContext('my-context');
			expect(otherContext).toBe(context);
		}));
	});

	describe('#getContext(String name)', function() {
		it('should return null if the context was not found', function() {
			var context = instance.getContext('null-context');
			expect(context).toBe(null);
		});

		it('should return a context that was created before with the given name', inject(function(RepositoryContext) {
			var context = instance.createContext('context');
			var foundContext = instance.getContext('context');
			expect(foundContext).not.toBe(null);
			expect(foundContext).toBe(context);
			expect(foundContext instanceof RepositoryContext).toBe(true);
		}));
	});

	describe('#removeContext(String name)', function() {
		it('should destroy a previously created context', inject(function(Repository, RepositoryContext) {
			var context = instance.createContext('context');
			expect(context instanceof RepositoryContext).toBe(true);

			instance.removeContext('context');
			context = instance.getContext('context');
			expect(context).toBe(null);
		}));
	});

	describe('#find(String id, Object [config])', function() {
		it('should retrieve a single entity with the given id through DataProvider#find', inject(function(RepositoryConfig, $q, $rootScope) {
			var config = instance.config,
				dataProvider = config.dataProvider,
				id = 'entity-id',

				entity = {
					id: id,
					name: 'John'
				},

				options = {};

			spyOn(dataProvider, 'find').and.returnValue($q.when(entity));

			var promise = instance.find(id, options),
				value;

			expect(dataProvider.find).toHaveBeenCalledWith(instance.config.name, id, options);

			promise.then(function(e) {
				value = e;
			});

			$rootScope.$digest();
			expect(value).toEqual(entity);
		}));
	});

	describe('#save(Object entity, Object [config])', function() {
		it('should persist the entity values', inject(function($q, $rootScope) {
			var config = instance.config,
				dataProvider = config.dataProvider,
				entity = {
					id: 'entity-id',
					name: 'John'
				},

				options = {};

			spyOn(dataProvider, 'save').and.returnValue($q.when(true));
			instance.save(entity, options);
			$rootScope.$digest();

			expect(dataProvider.save).toHaveBeenCalledWith(instance.config.name, entity, options);
		}));
	});

	describe('#saveAll(Object[] entities, Object [config])', function() {
		it('should only allow an array of objects as a valid entity set', inject(function($q, $rootScope) {
			var invalidSets = {
				empty: [],
				nullValues: [null, {}],
				numbers: [1, 2, 3],
				strings: ['one', 'two'],
				undefinedValues: [undefined]
			};

			var dataProvider = instance.config.dataProvider;
			spyOn(dataProvider, 'saveAll').and.callFake(function() {
				return $q.when(true);
			});

			Object.keys(invalidSets).forEach(function(key) {
				var invalidSet = invalidSets[key],
					onError = jasmine.createSpy('error-' + key);

				instance.saveAll(invalidSet).then(null, onError);
				$rootScope.$digest();

				expect(onError).toHaveBeenCalled();
			});

			expect(dataProvider.saveAll).not.toHaveBeenCalled();
		}));

		it('should persist a set of entities in batch mode', inject(function($q, $rootScope) {
			var config = instance.config,
				dataProvider = config.dataProvider,
				entitySet = [{
					id: 1,
					name: 'John'
				}, {
					id: 2,
					name: 'Paul'
				}],

				options = {};

			spyOn(dataProvider, 'saveAll').and.returnValue($q.when(true));
			instance.saveAll(entitySet, options);

			$rootScope.$digest();

			expect(dataProvider.saveAll).toHaveBeenCalledWith(instance.config.name, entitySet, options);
		}));
	});

	describe('#remove(String id, Object [config])', function() {
		it('should remove a single entity found by ID', inject(function($q, $rootScope) {
			var config = instance.config,
				dataProvider = config.dataProvider,
				entityId = 'entity-id',
				options = {};

			spyOn(dataProvider, 'remove').and.returnValue($q.when(true));
			instance.remove(entityId, options);
			$rootScope.$digest();

			expect(dataProvider.remove).toHaveBeenCalledWith(instance.config.name, entityId, options);
		}));
	});

	describe('#removeAll(String[] id, Object [config])', function() {
		it('should remove a set of entities in batch mode', inject(function($q, $rootScope) {
			var config = instance.config,
				dataProvider = config.dataProvider,
				entitySet = [1, 2, 3],
				options = {};

			spyOn(dataProvider, 'removeAll').and.returnValue($q.when(true));

			instance.removeAll(entitySet, options);
			$rootScope.$digest();

			expect(dataProvider.removeAll).toHaveBeenCalledWith(instance.config.name, entitySet, options);
		}));
	});

	describe('#createQuery()', function() {
		it('should create a instance of RepositoryQueryBuilder bound to the repository', inject(function(RepositoryQueryBuilder) {
			var query = instance.createQuery();
			expect(query instanceof RepositoryQueryBuilder).toBe(true);
			expect(query.$$repository).toBe(instance.config.name);
		}));
	});

	describe('#where()', function() {
		it('should create a instance of RepositoryQueryBuilder bound to the repository and call the where() method on instance', inject(function(RepositoryQueryBuilder) {
			var query = instance.where('name', 'foo');
			var filter = query.toJSON().filters[0];

			expect(query instanceof RepositoryQueryBuilder).toBe(true);
			expect(query.$$repository).toBe(instance.config.name);
			expect(filter).toEqual({
				name: 'name',
				value: 'foo',
				operator: '='
			});
		}));
	});

	describe('#findAll(QueryBuilder query, Object [config])', function() {
		it('should call the dataProvider with the query parameters and return a promise', inject(function($q, QueryBuilder) {
			var dataProvider = instance.dataProvider;
			var response = {
				meta: {
					count: 100,
					itemsPerPage: 2,
					currentPage: 1
				},
				data: [{}, {}]
			};

			var options = {};

			var qb = QueryBuilder.create()
				.from(instance.name)
				.limit(2)
				.skip(0);

			spyOn(dataProvider, 'findAll').and.returnValue($q.when(response));

			instance.findAll(qb, options);
			var args = dataProvider.findAll.calls.argsFor(0);

			expect(args[0]).toBe(qb.$$repository);

			expect(args[1].pagination).toEqual({
				currentPage: 1,
				itemsPerPage: 2
			});

			expect(args[1].sorting.length).toBe(0);
			expect(args[1].filters.length).toBe(0);

			expect(args[2]).toBe(options);
		}));

		it('should trow and error without a valid query builder', function() {
			function invalidQueryBuilder() {
				instance.findAll(new Date());
			}

			expect(invalidQueryBuilder).toThrow();
		});
	});

	describe('#findBy(String field, * value)', function() {
		it('should create a query builder with a single filter and return a call to #findAll()', inject(function($q, $rootScope, QueryBuilder) {
			var data = [];

			spyOn(instance, 'findAll').and.returnValue($q.when({
				data: data
			}));

			var success = jasmine.createSpy('success');
			instance.findBy('foo.id', '123').then(success);
			$rootScope.$digest();

			expect(instance.findAll).toHaveBeenCalled();
			var qb = instance.findAll.calls.argsFor(0)[0];
			var filter = qb.toJSON().filters[0];

			expect(filter.name).toBe('foo.id');
			expect(filter.operator).toBe(QueryBuilder.EQ);
			expect(filter.value).toBe('123');

			expect(success).toHaveBeenCalled();
			expect(success.calls.argsFor(0)[0]).toBe(data);
		}));

		it('should allow any operator other that EQ if the method is called with 3 arguments', inject(function($q, $rootScope, QueryBuilder) {
			spyOn(instance, 'findAll').and.returnValue($q.when({}));

			instance.findBy('user.age', QueryBuilder.LTE, 25);
			$rootScope.$digest();

			expect(instance.findAll).toHaveBeenCalled();
			var qb = instance.findAll.calls.argsFor(0)[0];
			var filter = qb.toJSON().filters[0];

			expect(filter.name).toBe('user.age');
			expect(filter.operator).toBe(QueryBuilder.LTE);
			expect(filter.value).toBe(25);
		}));

		it('should return an error if a property or a value are not specified', inject(function($rootScope, QueryBuilder) {
			function unroll(promise) {
				promise.then(null, function(value) {
					promise.result = value;
				});

				return promise;
			}

			var InvalidPropertyError = unroll(instance.findBy());
			var InvalidValueError = unroll(instance.findBy('name', QueryBuilder.LTE, undefined));
			$rootScope.$digest();

			expect(InvalidPropertyError.result.message).toBe('Missing filter name');
			expect(InvalidValueError.result.message).toBe('Missing filter value');
		}));
	});

	describe('#updateContext(RepositoryContext context)', function() {
		it('should call the dataProvider and update the context data based on context state. ' +
			'Must be automatically on context changes', inject(function($q, $rootScope) {
				var context = instance.createContext('test');
				var dataProvider = instance.dataProvider;

				context.initialize();

				var response = {
					meta: {
						count: 100,
						itemsPerPage: 2,
						currentPage: 1
					},
					data: [{}, {}]
				};

				spyOn(instance, 'updateContext').and.callThrough();
				spyOn(dataProvider, 'findAll').and.returnValue($q.when(response));

				context.filters().where('name', 'Bob');

				var contextState = context.toJSON();

				$rootScope.$digest();

				expect(instance.updateContext).toHaveBeenCalledWith(context);
				expect(dataProvider.findAll).toHaveBeenCalledWith(instance.config.name, contextState);
				expect(context.data).toBe(response.data);

				var paginationState = context.pagination().toJSON();
				expect(paginationState.count).toBe(response.meta.count);
				expect(paginationState.itemsPerPage).toBe(response.meta.itemsPerPage);
				expect(paginationState.currentPage).toBe(response.meta.currentPage);
			}));

		it('should call the dataProvider and update the context error if the fetching fails', inject(function($q, $rootScope) {
			var context = instance.createContext('fail-test');
			var dataProvider = instance.dataProvider;

			context.initialize();

			var response = {
				errors: ['some error']
			};

			spyOn(instance, 'updateContext').and.callThrough();
			spyOn(dataProvider, 'findAll').and.returnValue($q.reject(response));

			context.filters().where('name', 'Bob');

			var contextState = context.toJSON();
			$rootScope.$digest();

			expect(instance.updateContext).toHaveBeenCalledWith(context);
			expect(dataProvider.findAll).toHaveBeenCalledWith(instance.config.name, contextState);
			expect(context.error).toBe(response);
		}));
	});
});
