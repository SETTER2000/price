/**
 * Created by apetrov on 03.05.2017.
 */

angular.module('PRICE').controller('PageCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

    $scope.me = window.SAILS_LOCALS.me;


    $scope.submitNewPrice = function () {

        console.log($scope.price);
        $http.post('/file/upload', $scope.price)
            .then(function onSuccess(sailsResponse) {
                console.log('OK!');
                console.log(sailsResponse);
            })
            .catch(function onError(sailsResponse) {
                console.log("произошла непредвиденная ошибка: " + sailsResponse.data.statusText);
            })
            .finally(function eitherWay() {
                //$scope.busySubmittingVideo = false;
                //$scope.inputPrice = '';
            });
    };
}]);