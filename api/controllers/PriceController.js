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

//var _ = require('lodash');


module.exports = {
    upload: function (req, res) {

        Date.prototype.toLocaleFormat = function (format) {
            var f = {
                y: this.getYear() + 1900,
                m: this.getMonth() + 1,
                d: this.getDate(),
                H: this.getHours(),
                M: this.getMinutes(),
                S: this.getSeconds()
            }
            for (k in f)
                format = format.replace('%' + k, f[k] < 10 ? "0" + f[k] : f[k]);
            return format;
        };

        const pathUpload = 'assets/images/price';

        req.file('file').upload({
                dirname: require('path').resolve(sails.config.appPath, pathUpload)
            },
            function (err, files) {
                if (err) return res.serverError(err);
                if (_.isUndefined(files[0])) return res.notFound('Нет файла!');
                //sails.log(files[0]);

                /**
                 * Имя загружаемого файла
                 */
                const nameFUpload = files[0].filename;

                /**
                 * Наименование вендора
                 */
                const vendor = nameFUpload.slice(0, -5);

                /**
                 * Именование статусов
                 * @type {string}
                 */
                const statusSec = 'Принят частично';
                const statusOk = 'Принят полностью';
                const statusErr = 'Не принят';


                /**
                 * Формируем название файла отчёта NEW
                 */
                var d = new Date();
                const date = d.getDate() + '.' + d.getMonth() + '.' + d.getFullYear() + '_' +
                    d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds();
                const date2 = d.toLocaleFormat('%d.%m.%y %H:%M:%S');
                var fname = 'report-' + vendor + '-' + date + '.xlsx';


                /**
                 * Путь и название файла отчета по загрузке
                 * @type {string}
                 */
                const nameFileUpload = path.basename(files[0].fd);
                const pathToReport = "assets/images/price/report/" + nameFileUpload;
                const pathToReportNew = pathUpload + '/';

                /**
                 * Директория где сохраняется общий прайс
                 */
                const full = "assets/images/price/full/";

                /**
                 * Шаблон для полного прайса
                 */
                const templateOutPricePath = "assets/images/price/ideal/full_out.xlsx";

                /**
                 *
                 * @param a
                 * @returns {Array.<T>}
                 */
                Array.prototype.diff = function (a) {
                    return this.filter(function (i) {
                        return a.indexOf(i) < 0;
                    });
                };
                //sails.log('FILE: ');
                //sails.log(path.basename(files[0].fd));


                // Загрузить существующую книгу
                XlsxPopulate.fromFileAsync(files[0].fd)
                    .then(
                        function (workbook) {
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
                             * Проверяем наличие данных в книге
                             */

                            if (allRows < 2) {
                                return res.forbidden({
                                    message: 'Прайс пустой, проверять нечего! '
                                });
                            }


                            if (allRows < 3) {
                                return res.forbidden({
                                    message: 'Менее двух строк не обробатывается!'
                                });
                            }

                            // sails.log(matrix);
                            /**
                             * Всего колонок в книге
                             */
                            const allColumns = matrix._numColumns;


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
                                /**
                                 * Массив содержит номера строк с ошибками. Причём если в строке 5 имеются 3 ошибки,
                                 * в разных столбцах, то строка 5 будет повторяться в массиве 3 раза.
                                 * @type {Array}
                                 */
                                this.arrRowsError = [];
                                this.arrRowsValid = [];
                            }


                            /**
                             * Функция возвращает уникальный массив на основе массива this.arrRowsError.
                             * Массив будет содержать только уникальные номера строк с ошибками.
                             * При этом массив this.arrRowsError сохраняет свои значения.
                             *
                             * @returns {Array}
                             */

                            Ranges.prototype.uniqueArray = function () {
                                var obj = {};
                                // if(this.arrRowsError.length == allRows){
                                //     res.badRequest({message:'Прайс не прошёл проверку! Ни одна из строк не может быть добавлена в общий прайс.'})
                                // }
                                for (var i = 0; i < this.arrRowsError.length; i++) {
                                    var str = this.arrRowsError[i];
                                    obj[str] = true; // запомнить строку в виде свойства объекта
                                }
                                return Object.keys(obj); // или собрать ключи перебором для IE8-
                            };

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
                            //const full = new Ranges('FULL', `A1:K1`);
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
                            identifier.validationColumn(/^\d\d\d\d\d$/gi);
                            vendorid.validationUndefinedTwoColumn('C');
                            description.validationUndefinedColumn();
                            description.toStringCut(100);
                            header.validationUndefinedColumn();
                            status.validationReplaceStringColumn(/^NA$/gi, undefined);
                            status.toUppCase(); // диапазон в верхний регистр
                            // status.validationOneElementColumn(['SALE', 'EOL', 'DISCOUNTED', 'PROMO', 'CALL', 'NEW']);
                            status.validationColumn(/^(SALE|EOL|DISCOUNTED|PROMO|CALL|NEW|undefined)$/gi);
                            currency.validationColumn(/RUB|USD|EUR|undefined/g);
                            dealerprice.validationColumn(/^[1-9]+/g);
                            specialprice.validationColumn(/^[1-9]|undefined+/g);
                            openprice.validationColumn(/^[1-9]|undefined+/g);
                            note.validationColumn(/([-\wа-я_\s?!^:,#№"'+@.])/gi);
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
                                this.arrRowsValid = [];
                                for (let i = 2; i <= allRows; i++) {
                                    if (all.arrRowsError.indexOf(i) < 0) {
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
                                //sails.log('RRR');
                                //sails.log(all.arrRowsValid);
                                return this.arrRowsValid;
                            };


                            //sails.log('all.rowsValidArr():');
                            //sails.log(all.rowsValidArr());
                            //sails.log(all.arrRowsError);


                            /**
                             * Кол-во корректных строк в книге
                             */
                            Ranges.prototype.getAllValidCountRows = function () {
                                return (allRows - all.uniqueArray().length);
                            };


                            /**
                             * Какой процент ошибок в прайсе
                             * @returns {number}
                             */


                            Ranges.prototype.getAllErrorPercent = function () {
                                //sails.log(allRows);
                                //sails.log(this.arrRowsError.length);
                                // let percent = this.arrRowsError.length * 100 / allRows;
                                let percent = this.arrRowsError.length * 100 / +((allRows - 1) * allColumns);
                                return percent.toFixed(2);
                            };


                            /**
                             * На сколько процентов прайс валидный. Проверка по ячейкам.
                             * @returns {number}
                             */
                            Ranges.prototype.getAllValidPercent = function () {
                                //sails.log(allRows);
                                //sails.log(this.arrRowsError.length);
                                let percent = 100 - this.getAllErrorPercent();
                                return percent.toFixed(2);
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
                            sails.log('*    Всего ошибок                *');
                            sails.log('***********************************');
                            sails.log(all.arrRowsError.length);
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
                            sails.log('');
                            

                            if (all.uniqueArray().length == (allRows - 1)) {
                                return res.forbidden({
                                    message: 'Прайс не валидный! Ни одна строка не записана.'
                                });
                            }


                            /**
                             * Отчёт NEW
                             */
                            XlsxPopulate.fromBlankAsync()
                                .then(
                                    function (report) {
                                        var status = statusErr;
                                        report.sheet(0).cell("A1").value('Дата и время отчёта (загрузки)');
                                        report.sheet(0).cell("B1").value(date);
                                        report.sheet(0).cell("A2").value('Проверенный файл. Название загружаемого файла');
                                        report.sheet(0).cell("B2").value(nameFUpload);
                                        report.sheet(0).cell("A3").value('Общий статус загрузки');
                                        if (all.arrRowsError.length) {
                                            status = statusSec;
                                            report.sheet(0).cell("A4").value('Причина отклонения');
                                            report.sheet(0).cell("B4").value('Ошибок: ' + all.getAllErrorPercent() + '%');
                                            report.sheet(0).cell("A5").value('Строки с ошибками ');
                                            report.sheet(0).cell("B5").value(all.uniqueArray().join(' '));
                                        } else {
                                            status = statusOk
                                        }
                                        report.sheet(0).cell("B3").value(status);
                                        // Write to file.
                                        return report.toFileAsync(pathToReportNew + fname);
                                    },
                                    function (reject) {
                                        sails.log(reject);
                                        sails.log('Prommissss ' + error);
                                    }
                                );
                            XlsxPopulate.fromFileAsync(templateOutPricePath)
                                .then(
                                    function (fullPrice) {
                                        Price.destroy({vendor: vendor}).exec(function (err, destr) {
                                            if (err) sails.log('Ошибка при удалении записей из БД');
                                            let price = all.rowsValidArr();
                                            if (price.length > 0) {
                                                Price.findOrCreate(price, price).exec(
                                                    function userCreat(err, creat) {
                                                        if (err) return res.negotiate(err);
                                                        Price.find().sort({vendor: 1}).exec(
                                                            function userCreated(err, price) {
                                                                if (err) return res.negotiate(err);
                                                                if (!price) return res.notFound();
                                                                let io = 0;
                                                                async.each(price, function (priceRow, next) {
                                                                        io=io+2;
                                                                        fullPrice.sheet(0).row(io).cell(1).value(priceRow.vendor);
                                                                        fullPrice.sheet(0).row(io).cell(2).value(priceRow.dax_id);
                                                                        fullPrice.sheet(0).row(io).cell(3).value(priceRow.vendor_id);
                                                                        fullPrice.sheet(0).row(io).cell(4).value(priceRow.vendor_id2);
                                                                        fullPrice.sheet(0).row(io).cell(5).value(priceRow.description);
                                                                        fullPrice.sheet(0).row(io).cell(6).value(priceRow.status);
                                                                        fullPrice.sheet(0).row(io).cell(7).value(priceRow.currency);
                                                                        fullPrice.sheet(0).row(io).cell(8).value(priceRow.dealer_price);
                                                                        fullPrice.sheet(0).row(io).cell(9).value(priceRow.special_price);
                                                                        fullPrice.sheet(0).row(io).cell(10).value(priceRow.open_price);
                                                                        fullPrice.sheet(0).row(io).cell(11).value(priceRow.note);

                                                                        return next();
                                                                    },
                                                                    function (err) {
                                                                        if (err) return res.negotiate(err);
                                                                    });


                                                                return fullPrice.toFileAsync(full + 'price.xlsx').then(
                                                                    function (fulFilled) {
                                                                        if (all.arrRowsError.length) {
                                                                            workbook.toFileAsync(pathToReport);
                                                                            return res.ok({
                                                                                status: 202,
                                                                                message: statusSec,
                                                                                avatarFd: nameFileUpload,
                                                                                progress: all.getAllValidPercent(),
                                                                                errorPercent: all.getAllErrorPercent(),
                                                                                dateUpload: date2,
                                                                                uploaderButtonPrice: false,
                                                                                allEr: all.arrRowsError.length,
                                                                                goReport: true
                                                                            });
                                                                        } else {
                                                                            return res.ok({
                                                                                message: statusOk,
                                                                                avatarFd: nameFileUpload,
                                                                                progress: all.getAllValidPercent(),
                                                                                errorPercent: all.getAllErrorPercent(),
                                                                                dateUpload: date2,
                                                                                uploaderButtonPrice: false,
                                                                                allEr: all.arrRowsError.length,
                                                                                textParams: req.params.all(),
                                                                                goReport: true
                                                                            });
                                                                        }
                                                                    },
                                                                    function (reject) {
                                                                        sails.log('Prommissss 55 ' + reject);
                                                                    }
                                                                );
                                                            }
                                                        )
                                                        ;
                                                    });
                                            }
                                        });
                                    },
                                    function (reject) {
                                        sails.log('Ошибка  promise' + reject);
                                    });
                        },
                        function (reject) {
                            sails.log('Prommissss 45 ' + error);
                        }
                    );
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
    },
    date: function (req, res) {
        Price.find({}, {updatedAt: 1, _id: 0})
            .limit(1).sort({updatedAt: -1}).exec(function getDatePrice(err, datePrice) {
            if (err) res.negotiate(err);

            Date.prototype.toLocaleFormat = function (format) {
                var f = {
                    y: this.getYear() + 1900,
                    m: this.getMonth() + 1,
                    d: this.getDate(),
                    H: this.getHours(),
                    M: this.getMinutes(),
                    S: this.getSeconds()
                }
                for (k in f)
                    format = format.replace('%' + k, f[k] < 10 ? "0" + f[k] : f[k]);
                return format;
            };
            sails.log(datePrice);
            res.json(datePrice[0].updatedAt.toLocaleFormat('%d.%m.%y %H:%M:%S'));
        });
    }
};

