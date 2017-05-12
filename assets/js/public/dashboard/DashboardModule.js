angular.module('DashboardModule', ['ui.router', 'toastr', 'ngResource', 'angular-js-xlsx', 'angularFileUpload','ngAnimate'])
    //.config(function ($routeProvider, $locationProvider) {
    //    $routeProvider
    //
    //        .when('/', {
    //            templateUrl: '/js/private/dashboard/tpl/dashboard.tpl.html',
    //            controller: 'DashboardController'
    //        })
    //
    //        .when('/account', {
    //            templateUrl: '/js/private/dashboard/account/tpl/account.tpl.html',
    //            controller: 'AccountController'
    //        })
    //    ;
    //    $locationProvider.html5Mode({enabled: true, requireBase: false});
    //})
    .config(['$sceDelegateProvider', function($sceDelegateProvider) {
        // We must whitelist the JSONP endpoint that we are using to show that we trust it
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'http://localhost:1339/**'
        ]);
    }])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                views: {
                    //'sidebar@': {templateUrl: '/js/private/tpl/sidebar.tpl.html'},
                    '@': {
                        templateUrl: '/js/public/dashboard/tpl/dashboard.html',
                        controller: 'DashboardController'
                    }
                }
            })
            .state('home.upload', {
                url: 'upload',
                views: {
                    '@': {
                        templateUrl: '/js/public/dashboard/tpl/upload.html',
                        controller: 'DashboardController'
                    }
                }
            })
            .state('home.file.upload', {
                url: 'upload',
                views: {
                    '@': {
                        templateUrl: '/js/public/dashboard/tpl/upload.html',
                        controller: 'DashboardController'
                    }
                }
            })
            //.state('home.profile.edit', {
            //    url: '/edit',
            //    views: {
            //        '@': {
            //            templateUrl: '/js/private/dashboard/tpl/edit-profile.html',
            //            controller: 'EditProfileController'
            //        }
            //    }
            //})
            // .state('home.profile.restore', {
            //     url: 'restore',
            //     views: {
            //         '@': {
            //             templateUrl: '/js/private/dashboard/tpl/restore-profile.html',
            //             controller: 'RestoreProfileController'
            //         }
            //     }
            // })
            //    .state('account', {
            //        url: '/account',
            //        templateUrl: '/js/private/dashboard/account/tpl/account.tpl.html'
            //    })
            //    .state('contact', {
            //        url: '/contact',
            //        // Будет автоматически вложен в безымянный ui-view
            //        // родительского шаблона. Начиная с состояния верхнего уровня,
            //        // шаблоном этого родительского состояния является index.html.
            //        templateUrl: '/js/private/contacts.html'
            //    })
            //
            //    .state('contact.detail', {
            //        views: {
            //            /////////////////////////////////////////////////////
            //            // Относительное позиционирование                  //
            //            // позиционируется родительское состояние в ui-view//
            //            /////////////////////////////////////////////////////
            //
            //            // Относительное позиционирование вида 'detail' в родительском
            //            // состоянии 'contacts'.
            //            // <div ui-view='detail'/> внутри contacts.html
            //            // "detail": {},
            //
            //            // Относительное поциционирование безымянного вида в родительском
            //            // состояния 'contacts'.
            //            // <div ui-view/> внутри contacts.html
            //            // "": {}
            //
            //            ////////////////////////////////////////////////////////////////////////////
            //            // Абсолютное позиционирование '@'                                        //
            //            // Позиционирование любых видов внутри этого состояния илипредшествующего //
            //            ////////////////////////////////////////////////////////////////////////////
            //
            //            // Абсолютное позиционирование вида 'info' в состоянии 'contacts.detail'.
            //            // <div ui-view='info'/> внутри contacts.detail.html
            //            //"info@contacts.detail" : { }
            //
            //            // Абсолютное позиционирование вида 'detail' в состоянии 'contacts'.
            //            // <div ui-view='detail'/> внутри contacts.html
            //            "detail@contact": {templateUrl: '/js/private/contact.detail.tpl.html'}
            //
            //            // Абсолютное позиционирование безымянного вида в родительском
            //            // состоянии 'contacts'.
            //            // <div ui-view/> внутри contacts.html
            //            // "@contacts" : { }
            //
            //            // Абсолютное позиционирование вида 'status' в корневом безымянном состоянии.
            //            // <div ui-view='status'/> внутри index.html
            //            // "status@" : { }
            //
            //            // Абсолютное позиционирование безымянного вида в корневом безымянном состоянии.
            //            // <div ui-view/> внутри index.html
            //            // "@" : { }
            //        }
            //        // .state('route1.viewC', {
            //        //     url: "/route1",
            //        //     views: {
            //        //         "viewC": { template: "route1.viewA" }
            //        //     }
            //        // })
            //        // .state('route2', {
            //        //     url: "/route2",
            //        //     views: {
            //        //         "viewA": { template: "route2.viewA" },
            //        //         "viewB": { template: "route2.viewB" }
            //        //     }
            //        // })
            //    })
        ;
    })
    .directive('file', function () {
        return {
            scope: {
                file: '='
            },
            link: function (scope, el, attrs) {
                el.bind('change', function (event) {
                    var file = event.target.files[0];
                    scope.file = file ? file : undefined;
                    scope.$apply();
                });
            }
        };
    });
//.constant('CONF_MODULE', {baseUrl: '/price/:priceId'})
//.factory('Prices', function ($resource, $state, CONF_MODULE) {
//    var Prices = $resource(
//        CONF_MODULE.baseUrl,
//        {priceId: '@id'},
//        // Определяем собственный метод update на обоих уровнях, класса и экземпляра
//        {
//            update: {
//                method: 'PUT'
//            }
//        }
//    );
//})
;