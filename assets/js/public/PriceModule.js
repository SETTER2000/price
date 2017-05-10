angular.module('PriceModule', [
        'ui.router',
        'toastr',
        'ngResource',
        'ngAnimate',

        'DashboardModule'
    ])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode({enabled: true, requireBase: false});
        $urlRouterProvider.otherwise('/');


    });