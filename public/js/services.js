angular.module('bucketService', [])
.factory('Buckets', function($http, $q) {
	var Buckets = {};

	Buckets.all = function() {
		return $http.get('/buckets')
	};

	return Buckets;
});