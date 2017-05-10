/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const XlsxPopulate = require('xlsx-populate');
var fs = require('fs');
var _ = require('lodash');




module.exports = {
    index: function (req, res) {

        res.writeHead(200, {'content-type': 'text/html'});
        res.end(
            '<form action="/file/upload" enctype="multipart/form-data" method="post">' +
            '<input type="text" name="title"><br>' +
            '<input type="file" name="avatar" multiple="multiple"><br>' +
            '<input type="submit" value="Upload">' +
            '</form>'
        )
    },
    upload: function (req, res) {
        req.file('file').upload({
                dirname: require('path').resolve(sails.config.appPath, 'assets/images/price')
            },
            function (err, files) {
                if (err) return res.serverError(err);
                if (_.isUndefined(files[0])) return res.notFound('Нет файла!');


                Array.prototype.diff = function(a) {
                    return this.filter(function(i){return a.indexOf(i) < 0;});
                };
                sails.log('FILE: ');
                sails.log(files[0]);


                // Загрузить существующую книгу
                XlsxPopulate.fromFileAsync(files[0].fd)
                    .then((workbook, reject) => {
                        /**
                         * Шаблон названия листа.
                         * Это название должно так же быть и в загружаемом файле.
                         * @type {Sheet|Sheet|undefined}
                         */
                        const nameList = workbook.sheet("Лист1");

                        /**
                         *  Массив-шаблон названия столбцов,
                         *  с его помощью будет проверяться соответствие столбцов в загружаемом файле
                         * @type {string[]}
                         */
                        const arrNameColumnsIdeal = [
                            'ID',
                            'VendorID',
                            'VendorID 2',
                            'Description',
                            'Status',
                            'Currency',
                            'DealerPrice',
                            'SpecialPrice',
                            'OpenPrice',
                            'Note'
                        ];

                        /**
                         *  Массив для добавления имён столбцов из загружаемого файла
                         * @type {Array}
                         */
                        const arrNameColumns = [];


                        /**
                         * Проверка названия лист в загружаемом файле
                         * на соответствие шаблону
                         */
                        if (typeof nameList == "undefined" && !nameList) {
                            sails.log('Нет листа');
                            return res.forbidden("Лист с именем \"Лист1\" отсутствует в файле. Попробуйте изменить имя листа на \"Лист1\"");
                        }


                        /**
                         *  Получить названия колонок в загружаемом файле
                         */
                        for (var i = 1; i < 11; i++) {
                            arrNameColumns.push(workbook.sheet("Лист1").row(1).cell(i).value());
                        }


                        /**
                         * В загружаемом файле, проверяем соответствие заголовков столбцов шаблону и
                         * возвращаем массив заголовков не соответствующих шаблону либо пустой массив
                         *
                         */
                        var rs = arrNameColumnsIdeal.diff(arrNameColumns);
                        sails.log('result');
                        sails.log(rs);
                        if(rs.length > 0){
                            sails.log('Ошибка в названии столбца ' + rs + '!');
                            return res.badRequest('Ошибка в названии столбца ' + rs + '!');
                        }


                        //sails.log('strNameColumnsIdeal');
                        //sails.log(strNameColumnsIdeal);


                        //if(!strNameColumns === strNameColumnsIdeal){
                        //    sails.log('Строки не равны');
                        //}

                        // Получить значение ячейки
                        const value = workbook.sheet("Лист1").cell("A1").value();

                        sails.log('arrNameColumns');
                        sails.log(arrNameColumns);

                        sails.log('VALUE');
                        sails.log(value);

                        sails.log('arrNameColumns');
                        sails.log(arrNameColumns);
                        //sails.log('nameList');
                        //sails.log(nameList);
                        res.view('page/showhomepage', {layout: 'dashboard', me: {id: 1, file: files[0], message: 'Всё ОК!'}});
                    });

                //promise
                //    .then(
                //        result => alert("Fulfilled: " + result),
                //        error => alert("Rejected: " + error.message) // Rejected: время вышло!
                //    );
                //res.view('page/showhomepage', {layout: 'dashboard', me: {id:1, file:files[0], message:'Всё ОК!'}});
                //return res.redirect('back');


            });
    }
};

