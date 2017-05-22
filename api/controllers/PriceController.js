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
                //sails.log(files[0]);

                /**
                 * Наименование вендора
                 */
                const vendor = files[0].filename.slice(0, -5);


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
                        if (reject) return res.serverError(reject);

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
                         * Название листа.
                         * @type {Sheet|Sheet|undefined}
                         */
                        const nameList = workbook.sheet(0);


                        /**
                         * Матрица вся книга.
                         * @type {Range|undefined}
                         */
                        const matrix = workbook.sheet(0).usedRange();
                        //sails.log(matrix);


                        /**
                         * Всего строк в книге
                         */
                        const allRows = matrix._numRows;


                        /**
                         * Всего колонок в книге
                         */
                        const allColumns = matrix._numRows;


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
                        for (var i = 1; i <= countColumnsIdeal; i++) {
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
                        function Ranges(name, range, style) {
                            this.name = name;
                            this.range = range;
                            this.nameTwoColumn = 'C';
                            this.pattern = /^\d+$/gi;
                            this.style = style;
                            this.error = {};
                            this.currentError = 0;
                            this.arrRowsError = [];
                            this.arrRowsValid = [];
                        }


                        /**
                         * Создать счётчик
                         */
                        Ranges.prototype.createCounter = function () {
                            function counter() {
                                return counter.currentError++;
                            }

                            counter.currentError = this.currentError + 1;
                            return counter;

                        };


                        /**
                         * Получить диапазон объекта
                         * @returns {*}
                         */
                        Ranges.prototype.getRange = function () {
                            return this.range;
                        };


                        /**
                         * Получить имя диапазона
                         * @returns {*}
                         */
                        Ranges.prototype.getName = function () {
                            return this.name;
                        };


                        /**
                         * Валидация колонки по паттерну
                         * @param pattern
                         * @returns {number}
                         */
                        Ranges.prototype.validationColumn = function (pattern) {
                            let counter = this.createCounter();
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
                                    // кол-во ошибок
                                    this.currentError = counter();

                                    this.arrRowsError.push(range.rowNumber());

                                    err = 1;
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
                         * Переводит строку в верхний регистр
                         * @returns {string}
                         */
                        Ranges.prototype.toUppCase = function () {
                            workbook.sheet(0).range(this.range).forEach(range => {

                                // Координаты текущей ячейки. Например A3 или J55
                                let currentCell = range.columnName() + '' + range.rowNumber();

                                // Данные ячейки
                                let valueCell = `${range.value()}`;
                                if (valueCell !== 'undefined') {
                                    workbook.sheet(0).cell(currentCell).value(valueCell.toUpperCase());
                                }


                            });
                        };


                        /**
                         * Режит строку длинее lengths
                         * @returns {string}
                         */
                        Ranges.prototype.toStringCut = function (lengths) {
                            workbook.sheet(0).range(this.range).forEach(range => {

                                // Координаты текущей ячейки. Например A3 или J55
                                let currentCell = range.columnName() + '' + range.rowNumber();

                                // Данные ячейки
                                let valueCell = `${range.value()}`;

                                if (valueCell !== 'undefined') {
                                    workbook.sheet(0).cell(currentCell).value(valueCell.substring(0, lengths + 1));
                                }
                            });
                        };


                        /**
                         * Валидация ячеек диапазона.
                         * Ячейка должна содержать только одно значение из входящего массива
                         * @param arr
                         * @returns {number}
                         */
                        Ranges.prototype.validationOneElementColumn = function (arr) {
                            let counter = this.createCounter();
                            // Проходим по всем ячейкам диапазона текужего объекта
                            workbook.sheet(0).range(this.range).forEach(range => {

                                // Координаты текущей ячейки. Например A3 или J55
                                let currentCell = range.columnName() + '' + range.rowNumber();

                                // Данные ячейки
                                let valueCell = `${range.value()}`;

                                let e = valueCell.split(',');
                                let e2 = valueCell.split(' ');

                                // Проверяем, если данные не прошли валидацию,
                                // то красим ячейку красным цветом
                                if (e.length > 1 || e2.length > 1) {
                                    this.currentError = counter();
                                    this.arrRowsError.push(range.rowNumber());
                                    err = 1;
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
                                } else {
                                    let val = e[0];
                                    if (val !== 'undefined') {
                                        if (arr.indexOf(val) > -1) {
                                            workbook.sheet(0).cell(currentCell).value(val);
                                        } else {
                                            this.currentError = counter();
                                            this.arrRowsError.push(range.rowNumber());
                                            err = 1;
                                            workbook.sheet(0).cell(currentCell).style("fill", colorErrorCell);
                                        }
                                    }
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
                            let counter = this.createCounter();

                            // Заменяем паттерн, который был по умолчанию в классе
                            if (nameTwoColumn) this.nameTwoColumn = nameTwoColumn;

                            // Проходим по всем ячейкам диапазона текужего объекта
                            workbook.sheet(0).range(this.range).forEach(range => {

                                // Координаты текущей ячейки. Например A3 или J55
                                let currentCell = range.columnName() + '' + range.rowNumber();

                                // Координаты второй колонки
                                let twoCell = this.nameTwoColumn + '' + range.rowNumber();

                                // Данные ячейки
                                let valueCell = workbook.sheet(0).cell(currentCell).value();

                                // Проверяем, если данные не прошли валидацию,
                                // то красим ячейку красным цветом
                                if (valueCell == undefined) {
                                    if (range.row().cell(this.nameTwoColumn).value() == undefined) {
                                        this.currentError = counter();
                                        this.arrRowsError.push(range.rowNumber());
                                        err = 1;
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
                            let counter = this.createCounter();
                            // Проходим по всем ячейкам диапазона текужего объекта
                            workbook.sheet(0).range(this.range).forEach(range => {

                                // Координаты текущей ячейки. Например A3 или J55
                                let currentCell = range.columnName() + '' + range.rowNumber();

                                // Данные ячейки
                                let valueCell = workbook.sheet(0).cell(currentCell).value();

                                // Проверяем, если данные не прошли валидацию,
                                // то красим ячейку красным цветом
                                if (valueCell == undefined) {
                                    this.currentError = counter();
                                    this.arrRowsError.push(range.rowNumber());
                                    //sails.log('COU:');
                                    //sails.log(this.currentError);
                                    err = 1;
                                    workbook.sheet(0).cell(currentCell).style("fill", colorErrorCell);
                                }
                            });
                            if (err) return err;
                        };


                        /**
                         * Удаляет из ячейки
                         * @param pattern
                         * @returns {number}
                         */
                        Ranges.prototype.validationReplaceStringColumn = function (pattern, replace) {

                            // Заменяем паттер, который был по умолчанию в классе
                            if (pattern) this.pattern = pattern;

                            // Проходим по всем ячейкам диапазона текужего объекта
                            workbook.sheet(0).range(this.range).forEach(range => {

                                // Координаты текущей ячейки. Например A3 или J55
                                let currentCell = range.columnName() + '' + range.rowNumber();

                                // Данные ячейки
                                let valueCell = `${range.value()}`;

                                if (valueCell.match(pattern)) {
                                    workbook.sheet(0).cell(currentCell).value(replace);
                                }
                                // Проверяем, если данные не прошли валидацию,
                                // то красим ячейку красным цветом
                                //if (valueCell.match(this.pattern) == undefined) {
                                //    err=1;
                                //    //*********** !!! НЕ УДАЛЯТЬ! ***********************//
                                //    //sails.log('rowNumber');
                                //    //sails.log(range.rowNumber());
                                //    //sails.log('row');
                                //    //sails.log(range.row().cell(4).value());
                                //    //sails.log('columnName');
                                //    //sails.log(range.columnName() + '' + range.rowNumber());
                                //    //sails.log('sheet');
                                //    //sails.log(range.sheet().value());
                                //    workbook.sheet(0).cell(currentCell).style("fill", colorErrorCell);
                                //}
                            });
                            //if (err) return err;
                        };


                        /**
                         * Установить стили для диапазона
                         */
                        Ranges.prototype.setStyle = function () {
                            workbook.sheet(0).range(this.range).style(this.style);
                        };


                        /**
                         * Инициализация объектов диапазона
                         * @type {Ranges}
                         */

                        // Объект all будет содержать общую информацию по прайсу
                        const all = new Ranges('ALL', `A1:J${matrix._numRows}`);
                        const header = new Ranges('HEADER', 'A1:J1');
                        const identifier = new Ranges('ID', `A2:A${matrix._numRows}`);
                        const vendorid = new Ranges('VENDORID', `B2:B${matrix._numRows}`);
                        const vendorid2 = new Ranges('VENDORID2', `C2:C${matrix._numRows}`);
                        const description = new Ranges('DESCRIPTION', `D2:D${matrix._numRows}`);
                        const status = new Ranges('STATUS', `E2:E${matrix._numRows}`, {
                            bold: true,
                            fontFamily: 'Arial',
                            numberFormat: 4,
                            fontSize: 8,
                            fontColor: 'ff0000',
                            horizontalAlignment: 'center',
                            verticalAlignment: 'center'
                        });
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
                        err = identifier.validationColumn(/^\d\d\d\d\d$/gi);
                        err = vendorid.validationUndefinedTwoColumn('C');
                        err = description.validationUndefinedColumn();
                        description.toStringCut(100);
                        err = header.validationUndefinedColumn();
                        status.validationReplaceStringColumn(/^NA$/gi, undefined);
                        status.toUppCase(); // диапазон в верхний регистр
                        err = status.validationOneElementColumn(['SALE', 'EOL', 'DISCOUNTED', 'PROMO', 'CALL', 'NEW']);
                        err = currency.validationColumn(/RUB|USD|EUR|undefined/g);
                        err = dealerprice.validationColumn(/^[1-9]+/g);
                        err = specialprice.validationColumn(/^[1-9]|undefined+/g);
                        err = openprice.validationColumn(/^[1-9]|undefined+/g);
                        err = note.validationColumn(/([-\wа-я_\s?!^:,#№"'+@.])/gi);
                        note.toStringCut(60);


                        /**
                         * Применить стили для диапазона
                         */
                        status.setStyle();


                        /**
                         * Собираем номера строк, которые имеют ошибки во входящем прайсе
                         * @type {Array.<T>}
                         */
                        all.arrRowsError = all.arrRowsError.concat(
                            header.arrRowsError,
                            identifier.arrRowsError,
                            vendorid.arrRowsError,
                            description.arrRowsError,
                            status.arrRowsError,
                            currency.arrRowsError,
                            dealerprice.arrRowsError,
                            specialprice.arrRowsError,
                            openprice.arrRowsError,
                            note.arrRowsError
                        );
                        //sails.log('Все ошибки в строках: ' + all.arrRowsError);
                        //sails.log(all.arrRowsError.length);


                        /**
                         * Собираем коллекцию объектов валидных строк из входящего прайса
                         */
                        Ranges.prototype.setObjectRowsValid = function () {
                            for (let i = 2; i < allRows; i++) {
                                if (this.arrRowsError.indexOf(i) < 0) {
                                    let o = {};
                                    for (let y = 1; y < 11; y++) {
                                        let nameColumnHeader = workbook.sheet(0).row(1).cell(y).value();
                                        //sails.log(nameColumnHeader);
                                        switch (nameColumnHeader) {
                                            case 'ID':
                                                nameColumnHeader = 'dax_id';
                                                break;
                                            case 'VendorID':
                                                nameColumnHeader = 'vendor_id';
                                                break;
                                            case 'VendorID 2':
                                                nameColumnHeader = 'vendor_id2';
                                                break;
                                            case 'Description':
                                                nameColumnHeader = 'description';
                                                break;
                                            case 'Status':
                                                nameColumnHeader = 'status';
                                                break;
                                            case 'Currency':
                                                nameColumnHeader = 'currency';
                                                break;
                                            case 'DealerPrice':
                                                nameColumnHeader = 'dealer_price';
                                                break;
                                            case 'SpecialPrice':
                                                nameColumnHeader = 'special_price';
                                                break;
                                            case 'OpenPrice':
                                                nameColumnHeader = 'open_price';
                                                break;
                                            case 'Note':
                                                nameColumnHeader = 'note';
                                                break;
                                        }
                                        o[nameColumnHeader] = workbook.sheet(0).row(i).cell(y).value();
                                    }
                                    if (o !== 'undefined') {
                                        o['vendor'] = vendor;
                                        //r.push(o);
                                        this.arrRowsValid.push(o);
                                    }
                                }
                            }
                        };


                        /**
                         * Получить коллекцию объектов валидных строк входящего прайса
                         * @returns {Array}
                         */
                        Ranges.prototype.rowsValidArr = function () {
                            this.setObjectRowsValid();
                            return this.arrRowsValid;
                        };


                        sails.log(all.rowsValidArr());
                        //sails.log(all.arrRowsError);


                        /**
                         * Кол-во корректных строк в книге
                         */
                        Ranges.prototype.getAllValidCountRows = function () {
                            return (allRows - all.arrRowsError.length);
                        };


                        /**
                         * Какой процент шибок в прайсе
                         * @returns {number}
                         */
                        Ranges.prototype.getAllErrorPercent = function () {
                            //sails.log(allRows);
                            //sails.log(this.arrRowsError.length);
                            let percent = this.arrRowsError.length * 100 / allRows;
                            return percent.toFixed(3);
                        };


                        /**
                         * На сколько процентов прайс валидный
                         * @returns {number}
                         */
                        Ranges.prototype.getAllValidPercent = function () {
                            //sails.log(allRows);
                            //sails.log(this.arrRowsError.length);
                            let percent = ( this.getAllValidCountRows() * 100 / allRows);
                            return percent.toFixed(3);
                        };


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


                        // !!! НЕ УДАЛЯТЬ !!
                        sails.log('');
                        sails.log('***********************************');
                        sails.log('*    Кол-во ошибок в колонках     *');
                        sails.log('***********************************');
                        sails.log('Header: ' + header.currentError + ' Строки: ' + header.arrRowsError);
                        sails.log('ID: ' + identifier.currentError + ' Строки: ' + identifier.arrRowsError);
                        sails.log('VendorId: ' + vendorid.currentError + ' Строки: ' + vendorid.arrRowsError);
                        //sails.log('VendorId2: ' + vendorid2.currentError + ' Строки: ' + vendorid2.arrRowsError);
                        sails.log('Description: ' + description.currentError + ' Строки: ' + description.arrRowsError);
                        sails.log('Status: ' + status.currentError + ' Строки: ' + status.arrRowsError);
                        sails.log('Currency: ' + currency.currentError + ' Строки: ' + currency.arrRowsError);
                        sails.log('DealerPrice: ' + dealerprice.currentError + ' Строки: ' + dealerprice.arrRowsError);
                        sails.log('SpecialPrice: ' + specialprice.currentError + ' Строки: ' + specialprice.arrRowsError);
                        sails.log('OpenPrice: ' + openprice.currentError + ' Строки: ' + openprice.arrRowsError);
                        sails.log('Note: ' + note.currentError + ' Строки: ' + note.arrRowsError);
                        sails.log('');
                        sails.log('**********************************************');
                        sails.log('* Процентное соотношение загружаемого прайса *');
                        sails.log('**********************************************');
                        sails.log('Валидный на: ' + all.getAllValidPercent() + '%');
                        sails.log('Ошибок: ' + all.getAllErrorPercent() + '%');



                        Ranges.prototype.writeDatabase = function () {
                            let price = this.rowsValidArr();
                            //let r = [];
                            //for (let i = 1; i < allRows; i++) {
                            //    if (this.arrRowsError.indexOf(i) < 0) {
                            //        let o = {};
                            //        for (let y = 1; y < 11; y++) {
                            //            let nameColumnHeader = workbook.sheet(0).row(1).cell(y).value();
                            //            o[nameColumnHeader] = workbook.sheet(0).row(i).cell(y).value();
                            //        }
                            //        if (o !== 'undefined') {
                            //            r.push(o);
                            //        }
                            //    }
                            //}
                            for (let key in price) {
                                sails.log(price[key].dax_id);
                                sails.log(price[key].vendor_id);
                                if(price[key].dax_id == 'undefined') return;
                                Price.findOne({dax_id: + price[key].dax_id}).exec(function idDax(err, daxid) {
                                    //if (err) return res.view('public/header', {layout: 'homepage'});
                                    if (err) return res.negotiate(err);
                                    if (!daxid) {
                                        Price.create(price[key],
                                            function userCreated(err, newPrice) {
                                                if (err) {
                                                    console.log('err:', err);
                                                }
                                            });
                                    }

                                    //Price.update({dax_id: + price[key].dax_id}, price[key],
                                    //    function userCreated(err, newPrice) {
                                    //        if (err) {
                                    //            console.log('err:', err);
                                    //        }
                                    //    });
                                });
                            }


                        };

                        all.writeDatabase();




                        //Price.findOne({dax_id: dax_id}).exec(function idDax(err, daxid) {
                        //    //if (err) return res.view('public/header', {layout: 'homepage'});
                        //    if (err) return res.negotiate(err);
                        //    if (!daxid) {
                        //        Price.create({
                        //                vendor: vendor,
                        //                dax_id: dax_id,
                        //                vendor_id: 112,
                        //                vendor_id2: 23,
                        //                description: 'werwer',
                        //                status: 'dfsdf',
                        //                currency: 'RUB',
                        //                special_price: 1123,
                        //                dealer_price: 11123,
                        //                open_price: 123,
                        //                note: 'sdfs'
                        //            },
                        //            function userCreated(err, newPrice) {
                        //                if (err) {
                        //                    console.log('err:', err);
                        //                }
                        //            });
                        //    }
                        //
                        //    Price.update({dax_id: dax_id}, {
                        //            vendor: vendor,
                        //            vendor_id: 122,
                        //            vendor_id2: 233,
                        //            description: 'werwer',
                        //            status: 'dfsdf',
                        //            currency: 'RUB',
                        //            special_price: 123,
                        //            dealer_price: 123,
                        //            open_price: 123,
                        //            note: 'sdfs',
                        //            updatedAt: new Date()
                        //        },
                        //        function userCreated(err, newPrice) {
                        //            if (err) {
                        //                console.log('err:', err);
                        //            }
                        //        });
                        //});

                        /**
                         * Массив
                         * @type {Array}
                         */
                        if (all.arrRowsError.length) {
                            workbook.toFileAsync(pathToReport);
                            return res.badRequest({
                                message: 'Файл не принят есть ошибки. Скачайте отчёт, ' +
                                'исправьте помеченые красным ячейки и загрузите снова.',
                                avatarFd: nameFileUpload,
                                goReport: true
                            });
                        }


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

