/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const XlsxPopulate = require('xlsx-populate');
var fs = require('fs');
const path = require('path');
XLSX = require('xlsx');
var workbook = XLSX.readFile('test.xlsx');
//var _ = require('lodash');


module.exports = {
    upload: function (req, res) {
        req.file('file').upload({
                dirname: require('path').resolve(sails.config.appPath, 'assets/images/price')
            },
            function (err, files) {
                if (err) return res.serverError(err);
                if (_.isUndefined(files[0])) return res.notFound('Нет файла!');

                /**
                 * Путь и название файла отчета по загрузке
                 * @type {string}
                 */
                const nameFileUpload = path.basename(files[0].fd);
                const pathToReport = "assets/images/price/report/" + nameFileUpload;
                Array.prototype.diff = function (a) {
                    return this.filter(function (i) {
                        return a.indexOf(i) < 0;
                    });
                };
                //sails.log('FILE: ');
                //sails.log(path.basename(files[0].fd));


                // Загрузить существующую книгу
                XlsxPopulate.fromFileAsync(files[0].fd)
                    .then((workbook, reject) => {

                        /**
                         * Количество колонок в прайсе, которое должно быть по умолчанию
                         * @type {Number}
                         */
                        const countColumnsIdeal = sails.config.vendor.arrNameColumnsIdeal.length;


                        /**
                         * Шаблон названия листа.
                         * Это название должно так же быть и в загружаемом файле.
                         * @type {Sheet|Sheet|undefined}
                         */
                        const nameList = workbook.sheet(0);


                        /**
                         *  Массив-шаблон названия столбцов,
                         *  с его помощью будет проверяться соответствие столбцов в загружаемом файле
                         * @type {string[]}
                         */
                        const arrNameColumnsIdeal = sails.config.vendor.arrNameColumnsIdeal;


                        /**
                         *  Массив для добавления имён столбцов из загружаемого файла
                         * @type {Array}
                         */
                        const arrNameColumns = [];


                        /**
                         * Проверка названия листа в загружаемом файле
                         * на соответствие шаблону
                         */
                        //if (typeof nameList == "undefined" && !nameList) {
                        //    return res.forbidden({
                        //        message:"Лист с именем \"Лист1\" отсутствует в файле. Попробуйте изменить имя листа на \"Лист1\""
                        //        });
                        //}


                        /**
                         *  Получить названия колонок в загружаемом файле
                         */
                        for (var i = 1; i <= 10; i++) {
                            //var str = workbook.sheet(0).row(1).cell(i).value();
                            //if( str.localeCompare(arrNameColumnsIdeal[i]) !=0 ){
                            //    return res.forbidden({
                            //        message: 'Кол-во колонок не совпадает с шаблоном по умолчанию! ' +
                            //        'Должно быть '+arrNameColumnsIdeal+' колонок. '
                            //    });
                            //}

                            var nameColumn = workbook.sheet(0).row(1).cell(i).value();

                            if (typeof nameColumn == 'undefined' && arrNameColumns.length < countColumnsIdeal) {
                                return res.forbidden({
                                    message: 'Кол-во колонок не совпадает с шаблоном по умолчанию! ' +
                                    'Должно быть ' + countColumnsIdeal + ' колонок. '
                                });
                            }
                            //sails.log('countColumnsIdeal');
                            //sails.log(countColumnsIdeal);
                            //
                            //sails.log('arrNameColumns');
                            //sails.log(arrNameColumns);
                            //
                            //sails.log('arrNameColumns.length');
                            //sails.log(arrNameColumns.length);

                            //sails.log('nameColumn');
                            //sails.log(nameColumn);
                            //
                            //sails.log('arrNameColumnsIdeal[i]');
                            //sails.log(arrNameColumnsIdeal[i - 1]);

                            if (arrNameColumnsIdeal[i - 1] !== nameColumn) {
                                return res.forbidden({
                                    message: 'Не верное имя колонки ' +
                                    nameColumn + '! Колонка должна называться ' + arrNameColumnsIdeal[i - 1]
                                });
                            }

                            arrNameColumns.push(workbook.sheet(0).row(1).cell(i).value());
                        }

                        //sails.log('countColumnsIdeal');
                        //sails.log(countColumnsIdeal);
                        //
                        //sails.log('arrNameColumns');
                        //sails.log(arrNameColumns);
                        //
                        //sails.log('arrNameColumns.length');
                        //sails.log(arrNameColumns.length);


                        /**
                         * Сверяет кол-во колонок с шаблоном по умолчанию
                         */
                        if (countColumnsIdeal != arrNameColumns.length) {
                            return res.forbidden({
                                message: 'Кол-во колонок не совпадает с шаблоном по умолчанию!'
                            });
                        }


                        /**
                         * В загружаемом файле, проверяем соответствие заголовков столбцов шаблону и
                         * возвращаем массив заголовков не соответствующих шаблону либо пустой массив
                         *
                         */
                        var rs = arrNameColumnsIdeal.diff(arrNameColumns);
                        if (rs.length == 1) {
                            const cll = workbook.sheet(0).row(1).find(rs[0]);
                            workbook.sheet(0).row(1).cell(cll[0]._columnNumber).style({bold: true, fontColor: 'f90b0b'});
                            workbook.toFileAsync(pathToReport);
                            return res.badRequest({
                                message: 'Ошибка в названии столбца ' + rs + '!',
                                avatarFd: nameFileUpload,
                                goReport: true
                            });
                        }

                        if (rs.length > 1) {
                            return res.badRequest('Есть ошибки в названии столбцов ' + rs + '!');
                        }


                        //workbook.sheet(0).range("A2:L2").forEach(range => {
                        //
                        //    let valueCell = `${range.value()}`;
                        //    let pattern = /^\d\d\d\d\d$/gi;
                        //    let result = valueCell.match(pattern);
                        //
                        //    //
                        //    if (result == undefined) {
                        //        err++;
                        //        workbook.sheet(0).row(2).cell(++ys).style("fill", "ffc8ce");
                        //        sails.log(valueCell + ' ' + 'Не ID' + ' result: ' + result + ' typeof: ' + typeof valueCell);
                        //    }
                        //});
                        //var ys = 1;
                        var err = 0;
                        function validationRow(number){
                            const r = workbook.sheet(0).range(`A${number}:L${number}`).forEach(range => {

                                let valueCell = `${range.value()}`;
                                let pattern = /^\d\d\d\d\d$/gi;
                                let result = valueCell.match(pattern);

                                //
                                if (result == undefined) {
                                    err++;
                                    workbook.sheet(0).row(number).cell(number).style("fill", "ffc8ce");
                                    //sails.log(valueCell + ' ' + 'Не ID' + ' result: ' + result + ' typeof: ' + typeof valueCell);
                                }
                            });

                        }

                        for(let i= 2; i<= 100; i++){
                            validationRow(i);
                        }


                        /**
                         * Массив
                         * @type {Array}
                         */
                        if (err) {
                            workbook.toFileAsync(pathToReport);
                            return res.badRequest({
                                message: 'Файл не принят есть ошибки. Скачайте отчёт, ' +
                                'исправьте помеченые красным ячейки и загрузите снова.',
                                avatarFd: nameFileUpload,
                                goReport: true
                            });
                        }


                        // Отобразить значения колонки G
                        const value3 = workbook.sheet(0).column("G").width(25).hidden(false);
                        //sails.log('value3');
                        //sails.log(value3);

                        //setTimeout(function(){
                        //    return res.ok({
                        //        files: files,
                        //        textParams: req.params.all(),
                        //        goReport: false
                        //    });
                        //}, 5000);
                        return res.ok({
                            files: files,
                            textParams: req.params.all(),
                            goReport: false
                        });

                        //res.view('page/showhomepage', {layout: 'dashboard', me: {id: 1, file: files[0], message: 'Всё ОК!'}});
                    });

                //promise
                //    .then(
                //        result => alert("Fulfilled: " + result),
                //        error => alert("Rejected: " + error.message) // Rejected: время вышло!
                //    );
                //res.view('page/showhomepage', {layout: 'dashboard', me: {id:1, file:files[0], message:'Всё ОК!'}});
                //return res.redirect('back');


            });
    },
    download: function (req, res) {
        sails.log('LOCATION ВЫШЛА!!!!');
        sails.log(req.param('fd'));
        sails.log(req.param('cache'));
        var location = req.param('fd');

        var file = fs.readFileSync(location, 'binary');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', "attachment; filename=" + "6e1f78ae-6feb-4f21-8088-f33bee1460a0.xlsx");
        return res.end(file, 'binary');


        //res.attachment(location);
        var SkipperDisk = require('skipper-disk');
        var fileAdapter = SkipperDisk(/* optional opts */);

        fileAdapter.read(location).on('error', function (err) {
            sails.log('ОШИБОЧКА ВЫШЛА!!!!');
            return res.serverError(err);
        }).pipe(res);
    }
    //download: function (req, res){
    //    sails.log('UPS!!');
    //   return res.attachment('D:\host\home\price\www\assets\images\price\9a0340e9-d276-4151-90d1-77909f009660.xlsx');
    //    var SkipperDisk = require('skipper-disk');
    //    var fileAdapter = SkipperDisk(/* optional opts */);
    //
    //    // set the filename to the same file as the user uploaded
    //    res.set("Content-disposition", "attachment; filename='/host/home/price/www/assets/images/price/report/" + req.param('fileName') + "'");
    //
    //    // Stream the file down
    //    fileAdapter.read( req.param('fileName'))
    //        .on('error', function (err){
    //            return res.serverError(err);
    //        })
    //        .pipe(res);
    //}
};

