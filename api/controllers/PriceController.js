/**
 * PriceController
 *
 * @description :: Server-side logic for managing prices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const XlsxPopulate = require('xlsx-populate');
var fs = require('fs');


module.exports = {
    getPrice: function (req, res, next) {
        Price.find({
            //select: ['vendor', 'description'], // Optional
            where: {
                vendor: 'IBM'
            }
        }).exec(function (err, responseResult) {
            if (err) return res.serverError(err);
            if (!responseResult) return res.notFound();


            /**
             * Записываем данные
             */
            //XlsxPopulate.fromBlankAsync().then(workbook => {
            //    // Modify the workbook.
            //    workbook.sheet("Sheet1").cell("A1").value("This is neat!");
            //     // Write to file.
            //    return workbook.toFileAsync("./price-all.xlsx");
            //});

            /**
             *  Извлекаем данные
             */
            XlsxPopulate.fromFileAsync("./ibm.xlsx")
                .then(workbook => {
                    // Modify the workbook.
                    const value = workbook.sheet("Лист1").cell("A1").value();
                    const r = workbook.sheet(0).range("A1:C3");
                    const all = workbook.sheet(0).usedRange().value();
                    //console.log(value);
                    //console.log(r.cells());
                    //console.log(r);
                    console.log(all[0]);
                    console.log(all[1]);
                });
            res.ok(responseResult);
        });
    }
};

