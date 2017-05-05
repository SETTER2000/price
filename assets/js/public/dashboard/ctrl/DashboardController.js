angular.module('DashboardModule')
    //.constant('baseUrl', 'http://localhost:1337')
    .controller('DashboardController', ['$scope', '$window', '$state', '$http',  '$stateParams', 'toastr',  '$resource', '$rootScope',
        function ($scope, $window, $state, $http, angularFileUpload, $stateParams, toastr,  $resource, $rootScope) {
            $scope.me = window.SAILS_LOCALS.me;
            $scope.nameButton = 'Добавить';


            //var uploader = $scope.uploader = new FileUploader({
            //    url: '/upload'
            //});
            //
            //uploader.filters.push({
            //    name: 'customFilter',
            //    fn: function(item /*{File|FileLikeObject}*/, options) {
            //        return this.queue.length < 10;
            //    }
            //});
            //
            //uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
            //    console.info('onWhenAddingFileFailed', item, filter, options);
            //};
            //uploader.onAfterAddingFile = function(fileItem) {
            //    console.info('onAfterAddingFile', fileItem);
            //};
            //uploader.onAfterAddingAll = function(addedFileItems) {
            //    console.info('onAfterAddingAll', addedFileItems);
            //};
            //uploader.onBeforeUploadItem = function(item) {
            //    console.info('onBeforeUploadItem', item);
            //};
            //uploader.onProgressItem = function(fileItem, progress) {
            //    console.info('onProgressItem', fileItem, progress);
            //};
            //uploader.onProgressAll = function(progress) {
            //    console.info('onProgressAll', progress);
            //};
            //uploader.onSuccessItem = function(fileItem, response, status, headers) {
            //    console.info('onSuccessItem', fileItem, response, status, headers);
            //};
            //uploader.onErrorItem = function(fileItem, response, status, headers) {
            //
            //    toastr.error(response, 'Ошибка! DashboardController 33');
            //    console.info('onErrorItem', fileItem, response, status, headers);
            //};
            //uploader.onCancelItem = function(fileItem, response, status, headers) {
            //    console.info('onCancelItem', fileItem, response, status, headers);
            //};
            //uploader.onCompleteItem = function(fileItem, response, status, headers) {
            //    console.info('onCompleteItem', fileItem, response, status, headers);
            //};
            //uploader.onCompleteAll = function() {
            //    console.info('onCompleteAll');
            //};
            //
            //console.info('uploader', uploader);
            //
            //
            //$scope.uploadPrice = function () {
            //    var promise = $http.post('/file/upload', $scope.price);
            //    //console.log(promise);
            //    promise.then(fullfilled, rejected);
            //    return false
            //};
            ////console.log('PRICE: ');
            ////console.log($scope.price);

            $scope.addNewPrice = function (newPrice, isValid) {
                var g = $scope.file;
                console.log('FILE:');
                console.log(g);
                console.log('newPrice:');
                console.log(newPrice);

                var newPrice2 = {};
                newPrice2.avatar2 = g;

                var req = {
                    method: 'POST',
                    url: '/file/upload',
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    data: {
                        test: 'test',
                        gi: g
                    }
                    //transformRequest: function (data, headersGetter) {
                    //    var formData = new FormData();
                    //    angular.forEach(data, function (value, key) {
                    //        formData.append(key, value);
                    //    });
                    //
                    //    var headers = headersGetter();
                    //    delete headers['Content-Type'];
                    //
                    //    return formData;
                    //}
                };


                var promise = $http(req);
                //console.log(promise);
                promise.then(fullfilled, rejected);

                return false
            };
            //$scope.sendRequest = function () {
            //    var promise = $http.post('/user');
            //    //console.log(promise);
            //    promise.then(fullfilled, rejected);
            //    return false
            //};
            //
            //$scope.refresh = function () {
            //    $scope.item = Users.get({id: $routeParams.id}, function (users) {
            //        $scope.users = users;
            //        // кол-во пользователей
            //        // console.log($scope.users.length);
            //        // console.log($scope.users);
            //    }, function (err) {
            //        if (err) console.log(err.message);
            //    });
            //};
            //
            function fullfilled(response) {
                console.log('Status: ' + response.status);
                console.log('Type: ' + response.headers('content-type'));
                console.log('Length: ' + response.headers('content-length'));
                console.log('Length: ' + response.data);

                toastr.success(response.data, 'Ok!');
                //$scope.items = response.data.users;
            }

            function rejected(err) {
                console.log(err.data);
                toastr.error(err.data, 'Ошибка! DashboardController');
                //console.log('status' );
                //console.log(err.status);
                //console.log('err: ' );
                //console.log(err);
            }

            //
            //$scope.refresh();
        }]);