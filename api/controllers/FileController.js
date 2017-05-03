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
        console.log('req.file:');
        console.log(req.file('avatar'));
        //res.ok();
        req.file('avatar').upload({
                dirname: require('path').resolve(sails.config.appPath, 'assets/images')
            },
            function (err, files) {
                if (err) return res.serverError(err);

                return res.send({
                    view: 'homepage',
                    me: {
                        id: 1,
                        gravatarURL: 'http://www.gravatar.com/avatar/ef3eac6c71fdf24b13db12d8ff8d1264?',
                        email: 'sailsinaction@gmail.com',
                        message: files.length + ' file(s) uploaded successfully!',
                        files: files
                    }
                });
            });
    }
};

