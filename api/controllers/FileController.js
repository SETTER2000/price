/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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



        req.file('avatar').upload({
                dirname: require('path').resolve(sails.config.appPath, 'assets/images')
            },
            function (err, files) {
                if (err) return res.serverError(err);
                sails.log('FILE: ');
                sails.log(files[0]);

                if(files[0].fd){
                    //return res.ok('OKKK!');
                }

                res.view('page/showhomepage', {layout: 'dashboard', me: {id:1, file:files[0], message:'Всё ОК!'}});
                //return res.redirect('back');


            });
    }
};

