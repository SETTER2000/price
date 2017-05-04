angular.module('PriceModule', [
        'ui.router',
        'ngResource',
        'ngAnimate',
        'angularFileUpload',
        'DashboardModule'
    ])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode({enabled: true, requireBase: false});
        $urlRouterProvider.otherwise('/');


    });