angular.module('DashboardModule')
    //.constant('baseUrl', 'http://localhost:1337')
    .controller('DashboardController', ['$scope', '$http', 'toastr', '$templateCache', '$window', '$state', 'FileUploader', '$stateParams', '$resource', '$rootScope',
        function ($scope, $http, toastr, $templateCache, $window, $state, FileUploader, angularFileUpload, $stateParams, $resource, $rootScope) {
            $scope.me = window.SAILS_LOCALS.me;
            $scope.nameButton = 'Добавить';
            $scope.isMIME = 1;
            $scope.messMimeErr = '';
            $scope.goReport = false;

            /*********************************/


            $scope.read = function (workbook) {
                /* DO SOMETHING WITH workbook HERE */
                console.log(workbook);
            };

            $scope.error = function (e) {
                /* DO SOMETHING WHEN ERROR IS THROWN */
                console.log(e);
            };


            /* set up XMLHttpRequest */
            var url = "/images/price/report/";
            var oReq = new XMLHttpRequest();
            oReq.open("GET", url, true);
            oReq.responseType = "arraybuffer";
            var arraybuffer = oReq.response;

            /* convert data to binary string */
            var data = new Uint8Array(arraybuffer);
            var arr = new Array();
            for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
            var bstr = arr.join("");

            /* Call XLSX */
            var workbook = XLSX.read(bstr, {type:"binary"});


            oReq.onload = function(e) {
                var arraybuffer = oReq.response;

                /* convert data to binary string */
                var data = new Uint8Array(arraybuffer);
                var arr = new Array();
                for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                var bstr = arr.join("");

                /* Call XLSX */
                var workbook = XLSX.read(bstr, {type:"binary"});

                /* DO SOMETHING WITH workbook HERE */
            };

            oReq.send();

            //if(typeof require !== 'undefined') XLSX = require('xlsx');
            /* bookType can be any supported output type */
            //var workbook = XLSX.readFile('./out.xlsx');
            //var workbook = XLSX.utils.table_to_book(document.getElementById('tableau'));

            //XLSX.writeFile('/images/price/report/0c0171f9-850b-4cba-a13b-3178af8f5128.xlsx','YES.xlsx');


            var wopts = {bookType: 'xlsx', bookSST: false, type: 'binary'};

            var wbout = XLSX.write(workbook, wopts);

            function s2ab(s) {
                var buf = new ArrayBuffer(s.length);
                var view = new Uint8Array(buf);
                for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            }

            /* the saveAs call downloads a file on the local machine */
            saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), "report.xlsx");


            /*********************************/


            /**
             * Название вендоров
             * По этому массиву будет вестись проверка соответствия имён загружаемых файлов
             * @type {string[]}
             */
            var arrNameVendorIdeal = [
                'Allied Telesis',
                'Aquarius',
                'Avaya',
                'ClearOne',
                'Delta Electronics',
                'Eaton',
                'Fluke Ind',
                'Fluke Net',
                'Fujitsu',
                'Huawei',
                'Huawei-ВКС',
                'IBM',
                'Juniper',
                'MyToner',
                'OKI',
                'RIT',
                'Vertiv',
                'Zyxel'
            ];

            $scope.getReport = function (path) {

                $scope.code = null;
                $scope.response = null;

                //import saveAs from 'save-as';
                //$http({method: 'GET', url: "/get/report/?fd="+path,
                //    responseType: "arraybuffer"}).
                //success(function(data, status, headers, config) {
                //    // use the saveAs library to save the buffer as a blob on the user's machine. Use the correct MIME type!
                //    saveAs(new Blob([data],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), "excel.xlsx");
                //}).
                //error(function(data, status, headers, config) {
                //    console.log(data);
                //});

                $http.post('/get/report', {
                    fd: path,
                    responseType: "arraybuffer",
                    headers: {'Content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
                }).then(function (response) {
                    $scope.status = response.status;
                    saveAs(new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), "excel.xlsx");
                    return $scope.data = response.data;
                }, function (response) {
                    saveAs(new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), "excel2.xlsx");
                    $scope.data = response.data || 'Request failed';
                    $scope.status = response.status;
                });
                //$http.post('/get/report', {
                //    fd: path,
                //    headers:{'Content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
                //}).then(function(response) {
                //    $scope.status = response.status;
                //    saveAs(new Blob([data],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), "test.xlsx");
                //  return  $scope.data = response.data;
                //}, function(response) {
                //    $scope.data = response.data || 'Request failed';
                //    $scope.status = response.status;
                //});
            };


            //$scope.info = {};
            //$scope.info.description ='';
            //toastr.options = {
            //    "closeButton": false,
            //    "debug": false,
            //    "newestOnTop": false,
            //    "progressBar": false,
            //    "positionClass": "toast-top-right",
            //    "preventDuplicates": false,
            //    "onclick": null,
            //    "showDuration": "300",
            //    "hideDuration": "1000",
            //    "timeOut": "5000",
            //    "extendedTimeOut": "1000",
            //    "showEasing": "swing",
            //    "hideEasing": "linear",
            //    "showMethod": "fadeIn",
            //    "hideMethod": "fadeOut"
            //};
            var uploader = $scope.uploader = new FileUploader({
                url: '/file/upload',
                autoUpload: true
            });
            // a sync filter
            uploader.filters.push({
                name: 'syncFilter',
                fn: function (item /*{File|FileLikeObject}*/, options) {
                    console.log('syncFilter');
                    return this.queue.length < 10;
                }
            });

            // an async filter
            uploader.filters.push({
                name: 'asyncFilter',
                fn: function (item /*{File|FileLikeObject}*/, options, deferred) {
                    console.log('asyncFilter');
                    setTimeout(deferred.resolve, 1e3);
                }
            });

            /**
             * Фильтр проверяет рассширение
             * Доступны для загрузки только xlsx файлы
             */
            uploader.filters.push({
                name: 'expFilter',
                fn: function (item) {
                    if (item.name.slice(-4) !== 'xlsx') {
                        toastr.error('Расширение файла должно быть xlsx.', 'Ошибка!');
                        return false;
                    }

                    return true;
                }
            });
            /**
             * Фильтр перед загрузкой на сервер.
             * Проверяет имя файла на соответствие массиву вендоров.
             * Если имя файла не соответствует ни одному вендору,
             * то файл не ставится в очередь на загрузку.
             */
            uploader.filters.push({
                name: 'nameFileFilter',
                fn: function (item) {
                    if ($scope.rs = arrNameVendorIdeal.indexOf(item.name.slice(0, -5)) < 0) {
                        toastr.error('Имя файла должно соответствовать названию вендора.', 'Ошибка!');
                        return false;
                    }
                    return true;
                }
            });


            // CALLBACKS

            uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
                console.info('onWhenAddingFileFailed', item, filter, options);
            };
            uploader.onAfterAddingFile = function (fileItem) {
                console.info('onAfterAddingFile', fileItem);
            };
            uploader.onAfterAddingAll = function (addedFileItems) {
                console.info('onAfterAddingAll', addedFileItems);
            };
            uploader.onBeforeUploadItem = function (item) {
                console.info('onBeforeUploadItem', item);
            };
            uploader.onProgressItem = function (fileItem, progress) {
                console.info('onProgressItem', fileItem, progress);
            };
            uploader.onProgressAll = function (progress) {
                console.info('onProgressAll', progress);
            };
            uploader.onSuccessItem = function (fileItem, response, status, headers) {
                console.info('onSuccessItem', fileItem, response, status, headers);
            };
            uploader.onErrorItem = function (fileItem, response, status, headers) {
                return response;
                //console.info('onErrorItem', response);
            };
            uploader.onCancelItem = function (fileItem, response, status, headers) {
                console.info('onCancelItem', fileItem, response, status, headers);
            };
            uploader.onCompleteItem = function (fileItem, response, status, headers) {
                console.info('onCompleteItem', fileItem, response, status, headers);
                if (status > 200) {
                    toastr.error(response.message, 'Ошибка! Статус ' + status);
                    $scope.pathToReport = response.avatarFd;
                    $scope.goReport = response.goReport;
                    return;
                }
                $scope.pathToReport = response.avatarFd;
                console.log('RESPONSE');
                console.log(response.avatarFd);
                toastr.success(response, 'Ok! Статус ' + status);

            };
            uploader.onCompleteAll = function () {
                console.info('onCompleteAll');
            };

            //console.info('uploader', uploader);


            toastr.options = {
                "closeButton": true
                //"debug": false,
                //"newestOnTop": false,
                //"progressBar": false,
                //"positionClass": "toast-top-right",
                //"preventDuplicates": false,
                //"onclick": null,
                //"showDuration": "300",
                //"hideDuration": "1000",
                //"timeOut": "5000",
                //"extendedTimeOut": "1000",
                //"showEasing": "swing",
                //"hideEasing": "linear",
                //"showMethod": "fadeIn",
                //"hideMethod": "fadeOut"
            };


            $scope.$watch('isMIME', function (value) {
                $scope.isMIME = value;
            });

            //$scope.updateSize = function updateSize() {
            //    $scope.nameButton = 'xvbcbc';
            //    var file = document.getElementById("inputPrice").files[0],
            //        ext = "не определилось",
            //        parts = file.name.split('.');
            //    if (parts.length > 1) ext = parts.pop();
            //
            //    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
            //        $scope.isMIME = 0;
            //    } else {
            //        var messMimeErr = 'Ошибка: Расширение не поддерживается.';
            //    }
            //
            //    document.getElementById("e-fileinfo").innerHTML = [
            //        "Размер файла: " + file.size + " B",
            //        "Расширение: " + ext,
            //        //"MIME тип: " + file.type,
            //        messMimeErr
            //
            //    ].join("<br>");
            //};

            //document.getElementById('inputPrice').addEventListener('change', $scope.updateSize);
            $scope.kb = function (ch) {
                var size = (ch / 1024).toFixed(2);
                if (size > 1023) {
                    return ((ch / 1024) / 1024).toFixed(2) + " Mb";
                }
                return size + " Kb";
            };

            $scope.fileNameChanged = function (ele) {
                var files = ele.files;
                var l = files.length;
                var namesArr = [];

                for (var i = 0; i < l; i++) {

                    if (files[i].type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                        $scope.isMIME = 0;
                        $scope.messMimeErr = '';
                        namesArr.push('Добавлен файл: ' + files[i].name + ' (' + $scope.kb(files[i].size) + ')');


                    } else {
                        $scope.isMIME = 1;
                        $scope.messMimeErr = 'Ошибка: Расширение не поддерживается. Создайте файл с расширением xlsx';
                    }

                    //namesArr.push(files[i].name,files[i].type,files[i].size + " B");
                }

                //console.log(ele);
                var promise = $http.post('/file/upload', ele);
                //console.log(promise);
                promise.then(fullfilled, rejected);

                //toastr.success('Объект удалён.', 'OK! ');

                $scope.namesString = namesArr.join(' ,');
                $scope.$apply();
                //console.log($scope.namesString);
            };

            //toastr.error(err.data.details, 'Ошибка - 889! ' + err.data.message);
            //$scope.isMI = function () {
            //
            //    $scope.isMIME = true;
            //};


            //$scope.updateSize = function () {
            //    var file = document.getElementById("uploadInput").files[0],
            //        ext = "не определилось",
            //        parts = file.name.split('.');
            //    if (parts.length > 1) ext = parts.pop();
            //    document.getElementById("e-fileinfo").innerHTML = [
            //        "Размер файла: " + file.size + " B",
            //        "Расширение: " + ext,
            //        "MIME тип: " + file.type
            //    ].join("<br>");
            //};
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


                var req = {
                    method: 'POST',
                    url: '/file/upload',
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    data: newPrice
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