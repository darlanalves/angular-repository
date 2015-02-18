/**
 * @factory DataProviderInterface
 */
function DataProviderInterfaceFactory(utils, $q) {
	function DataProviderInterface() {}

	function extend(prototype) {
		return utils.extend(DataProviderInterface, prototype);
	}

	function notImplemented(method) {
		return function() {
			return $q.reject(new Error(method + '() is not implemented'));
		};
	}

	DataProviderInterface.extend = extend;

	DataProviderInterface.prototype = {
		findOne: notImplemented('findOne'),
		findAll: notImplemented('findAll'),
		remove: notImplemented('remove'),
		save: notImplemented('save'),

		canGet: canDoMethod,
		canSave: canDoMethod,
		canRemove: canDoMethod,
		canList: canDoMethod
	};

	function canDoMethod() {
		return true;
	}

	return DataProviderInterface;
}