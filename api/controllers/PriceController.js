/**
 * PriceController
 *
 * @description :: Server-side logic for managing prices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const XlsxPopulate = require('xlsx-populate');
var fs = require('fs');
var _ = require('lodash');
//var multer  = require('multer');
//var upload = multer({ dest: 'uploads/' });

module.exports = {
    testPrice: function (req, res, next) {
        if (!req.session.me) {
            return res.view('page/showhomepage', {layout: 'dashboard', me: null});
        }

        sails.log(req.body);

        req.file('avatar').upload(function (err, uploadedFiles) {
            if (err) return res.send(500, err);
            return res.json({
                message: uploadedFiles.length + ' file(s) uploaded successfully!',
                files: uploadedFiles
            });
        });

        //req.file('avatar').upload({
        //    saveAs: function(file, cb) {
        //        cb(null, file.filename);
        //    },
        //    dirname: require('path').resolve(sails.config.appPath, 'assets/images')
        //}, function whenDone(err, uploadedFiles) { //onUploadComplete
        //    if (err){
        //        return res.serverError(err);
        //    } else{
        //        return res.view('dashboard', {file:uploadedFiles});
        //    }
        //    if (uploadedFiles.length==0) {
        //        //if no file selected.
        //        sails.log.info('nothing selected');
        //        return res.view('dashboard');
        //    }
        //
        //});


        //router.get("/download", function (req, res, next) {
        // Open the workbook.
        console.log('SRCCCCCCCCCC: ');
        console.log(req.allParams());

        console.log(req.param('avatar'));
        //if(!_.isObject(req.param('avatar'))){
        //    return res.badRequest('Файл не загружен!.');
        //}

        //XlsxPopulate.fromFileAsync(req.param('avatar'))
        ////XlsxPopulate.fromFileAsync("ibm.xlsx")
        //    .then(workbook => {
        //        // Make edits.
        //        workbook.sheet(0).cell("A1").value("foo");
        //
        //        // Get the output
        //        return workbook.outputAsync();
        //    })
        //    .then(data => {
        //        // Set the output file name.
        //        res.attachment("output.xlsx");
        //
        //        // Send the workbook.
        //        res.send(data);
        //    })
        //    .catch(next);

        //var user ={'id':1};
        //req.session.me = user.id;
        //res.ok();
        //return res.view({
        //    me: user
        //});
        //});
    },
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

