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
                        var err = 0;

                        /**
                         * Цвет ячеек с ошибками
                         * @type {string}
                         */
                        const colorErrorCell = "ffc8ce";


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
                         * Матрица все книги.
                         * @type {Range|undefined}
                         */
                        const matrix = workbook.sheet(0).usedRange();


                        sails.log(matrix);
                        
                        
                        
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
                        for (var i = 1; i <= arrNameColumnsIdeal; i++) {
                            var nameColumn = workbook.sheet(0).row(1).cell(i).value();

                            if (typeof nameColumn == 'undefined' && arrNameColumns.length < countColumnsIdeal) {
                                return res.forbidden({
                                    message: 'Кол-во колонок не совпадает с шаблоном по умолчанию! ' +
                                    'Должно быть ' + countColumnsIdeal + ' колонок. '
                                });
                            }
                            if (arrNameColumnsIdeal[i - 1] !== nameColumn) {
                                return res.forbidden({
                                    message: 'Не верное имя колонки ' +
                                    nameColumn + '! Колонка должна называться ' + arrNameColumnsIdeal[i - 1]
                                });
                            }

                            arrNameColumns.push(workbook.sheet(0).row(1).cell(i).value());
                        }

                        
                        /**
                         * Именуем диапазоны входящего прайса для удобного разбора
                         * Объект для диапазонов
                         */
                        function Ranges(name, range) {
                            this.name = name;
                            this.range = range;
                            this.nameTwoColumn = 'C';
                            this.pattern = /^\d+$/gi;
                        }

                        Ranges.prototype.getRange = function () {
                            return this.range;
                        };

                        Ranges.prototype.getName = function () {
                            return this.name;
                        };


                        /**
                         * Валидация колонки по паттерну
                         * @param pattern
                         * @returns {number}
                         */
                        Ranges.prototype.validationColumn = function (pattern) {

                            // Заменяем паттер, который был по умолчанию в классе
                            if (pattern) this.pattern = pattern;

                            // Проходим по всем ячейкам диапазона текужего объекта
                            workbook.sheet(0).range(this.range).forEach(range => {

                                // Координаты текущей ячейки. Например A3 или J55
                                let currentCell = range.columnName() + '' + range.rowNumber();

                                // Данные ячейки
                                let valueCell = `${range.value()}`;

                                // Проверяем, если данные не прошли валидацию,
                                // то красим ячейку красным цветом
                                if (valueCell.match(this.pattern) == undefined) {
                                    err++;
                                    //*********** !!! НЕ УДАЛЯТЬ! ***********************//
                                    //sails.log('rowNumber');
                                    //sails.log(range.rowNumber());
                                    //sails.log('row');
                                    //sails.log(range.row().cell(4).value());
                                    //sails.log('columnName');
                                    //sails.log(range.columnName() + '' + range.rowNumber());
                                    //sails.log('sheet');
                                    //sails.log(range.sheet().value());
                                    workbook.sheet(0).cell(currentCell).style("fill", colorErrorCell);
                                }
                            });
                            if (err) return err;
                        };


                        /**
                         * Валидация двух смежных ячеек на заполнение.
                         * Впринципе можно использовать и для не смежных ячеек в одной строке.
                         * @param nameTwoColumn
                         * @returns {number}
                         */
                        Ranges.prototype.validationUndefinedTwoColumn = function (nameTwoColumn) {

                            // Заменяем паттерн, который был по умолчанию в классе
                            if (nameTwoColumn) this.nameTwoColumn = nameTwoColumn;

                            // Проходим по всем ячейкам диапазона текужего объекта
                            workbook.sheet(0).range(this.range).forEach(range => {

                                // Координаты текущей ячейки. Например A3 или J55
                                let currentCell = range.columnName() + '' + range.rowNumber();

                                // Координаты второй колонки
                                let twoCell = this.nameTwoColumn+''+range.rowNumber();

                                // Данные ячейки
                                let valueCell = workbook.sheet(0).cell(currentCell).value();

                                // Проверяем, если данные не прошли валидацию,
                                // то красим ячейку красным цветом
                                if (valueCell == undefined) {
                                    if (range.row().cell(this.nameTwoColumn).value() == undefined) {
                                        err++;
                                        //*********** !!! НЕ УДАЛЯТЬ! ***********************//
                                        //sails.log('rowNumber');
                                        //sails.log(range.rowNumber());
                                        //sails.log('row');
                                        //sails.log(range.row().cell(4).value());
                                        //sails.log('columnName');
                                        //sails.log(range.columnName() + '' + range.rowNumber());
                                        //sails.log('sheet');
                                        //sails.log(range.sheet().value());
                                        workbook.sheet(0).cell(twoCell).style("fill", colorErrorCell);
                                        workbook.sheet(0).cell(currentCell).style("fill", colorErrorCell);
                                    }
                                }
                            });
                            if (err) return err;
                        };


                        /**
                         * Валидация колонки на пустоту, т.е. ячейка не может быть пустой
                         * @returns {number}
                         */
                        Ranges.prototype.validationUndefinedColumn = function () {

                            // Проходим по всем ячейкам диапазона текужего объекта
                            workbook.sheet(0).range(this.range).forEach(range => {

                                // Координаты текущей ячейки. Например A3 или J55
                                let currentCell = range.columnName() + '' + range.rowNumber();

                                // Данные ячейки
                                let valueCell = workbook.sheet(0).cell(currentCell).value();

                                // Проверяем, если данные не прошли валидацию,
                                // то красим ячейку красным цветом
                                if (valueCell == undefined) {
                                    workbook.sheet(0).cell(currentCell).style("fill", colorErrorCell);
                                }
                            });
                            if (err) return err;
                        };


                        //validationRows

                        /**
                         * Инициализация объектов диапазона
                         * @type {Ranges}
                         */

                        const all = new Ranges('ALL', `A1:J${matrix._numRows}`);
                        const header = new Ranges('HEADER', 'A1:J1');
                        const identifier = new Ranges('ID', `A2:A${matrix._numRows}`);
                        const vendorid = new Ranges('VENDORID', `B2:B${matrix._numRows}`);
                        const vendorid2 = new Ranges('VENDORID2', `C2:C${matrix._numRows}`);
                        const description = new Ranges('DESCRIPTION', `D2:D${matrix._numRows}`);
                        const status = new Ranges('STATUS', `E2:E${matrix._numRows}`);
                        const currency = new Ranges('CURRENCY', `F2:F${matrix._numRows}`);
                        const dealerprice = new Ranges('DEALERPRICE', `G2:G${matrix._numRows}`);
                        const specialprice = new Ranges('SPECIALPRICE', `H2:H${matrix._numRows}`);
                        const openprice = new Ranges('OPENPRICE', `I2:I${matrix._numRows}`);
                        const note = new Ranges('NOTE', `J2:J${matrix._numRows}`);

                        /**
                         * Инициализация имён диапазонов в загружаемом прайсе
                         */

                        // ALL
                        workbook.definedName(all.getName(), workbook.sheet(0).range(all.getRange()));

                        // HEADER
                        workbook.definedName(header.getName(), workbook.sheet(0).range(header.getRange()));
                        //sails.log(workbook.definedName(header.getName()).value());

                        // ID
                        workbook.definedName(identifier.getName(), workbook.sheet(0).range(identifier.getRange()));
                        // sails.log(workbook.definedName(identifier.getName()).value());

                        // VENDORID
                        workbook.definedName(vendorid.getName(), workbook.sheet(0).range(vendorid.getRange()));
                        //sails.log(workbook.definedName(vendorid.getName()).value());

                        // VENDORID2
                        workbook.definedName(vendorid2.getName(), workbook.sheet(0).range(vendorid2.getRange()));
                        //sails.log(workbook.definedName(vendorid2.getName()).value());

                        // DESCRIPTION
                        workbook.definedName(description.getName(), workbook.sheet(0).range(description.getRange()));
                        //sails.log(workbook.definedName(description.getName()).value());

                        // STATUS
                        workbook.definedName(status.getName(), workbook.sheet(0).range(status.getRange()));
                        //sails.log(workbook.definedName(status.getName()).value());

                        // CURRENCY
                        workbook.definedName(currency.getName(), workbook.sheet(0).range(currency.getRange()));
                        //sails.log(workbook.definedName(currency.getName()).value());

                        // DEALERPRICE
                        workbook.definedName(dealerprice.getName(), workbook.sheet(0).range(dealerprice.getRange()));
                        //sails.log(workbook.definedName(dealerprice.getName()).value());

                        // SPECIALPRICE
                        workbook.definedName(specialprice.getName(), workbook.sheet(0).range(specialprice.getRange()));
                        //sails.log(workbook.definedName(specialprice.getName()).value());

                        // OPENPRICE
                        workbook.definedName(openprice.getName(), workbook.sheet(0).range(openprice.getRange()));
                        //sails.log(workbook.definedName(openprice.getName()).value());

                        // NOTE
                        workbook.definedName(note.getName(), workbook.sheet(0).range(note.getRange()));
                        //sails.log(workbook.definedName(note.getName()).value());

                        /**
                         * VALIDATION
                         */
                        //err = all.validationRows(/^\d\d\d\d\d$/gi);
                        err = identifier.validationColumn(/^\d\d\d\d\d$/gi);
                        err = vendorid.validationUndefinedTwoColumn('C');
                        err = description.validationUndefinedColumn();
                        //err = status.validationColumn(/RUR|USD|EUR/g);
                        err = currency.validationColumn(/RUB|USD|EUR|undefined/g);
                        err = dealerprice.validationColumn(/^[1-9]+/g);
                        err = specialprice.validationColumn(/^[1-9]|undefined+/g);
                        err = openprice.validationColumn(/^[1-9]|undefined+/g);
                        //err = note.validationColumn(/RUR|USD|EUR/g);

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
                    });
            });
    },
    download: function (req, res) {
        var location = req.param('fd');
        var file = fs.readFileSync(location, 'binary');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', "attachment; filename=" + "6e1f78ae-6feb-4f21-8088-f33bee1460a0.xlsx");
        return res.end(file, 'binary');
        var SkipperDisk = require('skipper-disk');
        var fileAdapter = SkipperDisk(/* optional opts */);
        fileAdapter.read(location).on('error', function (err) {
            return res.serverError(err);
        }).pipe(res);
    }
};

