var BucketsApp = angular.module('BucketsApp', ['bucketService', 'ngResource', 'ui.router']);

BucketsApp.config(function($stateProvider, $urlRouterProvider) {
	/* ====================
              ROUTES
   	   ==================== */
   	$urlRouterProvider.otherwise('/');

   	$stateProvider
   		.state('home', {
   			url: '/',
   			templateUrl: 'views/home.html'
   		})
      .state('login', {
        url: '/login',
        tempalteUrl: 'views/login.html'
      })
});

BucketsApp.controller('mainController', function($http, $scope, Buckets) {
	var vm = this;

	Buckets.all()
		.success(function(data) {
			vm.buckets = data;
		})
});