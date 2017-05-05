/**
 * PageController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    logout: function (req, res) {

        if (!req.session.me) {
            return res.redirect('/');
        }

        User.findOne(req.session.me, function (err, user) {
            if (err) {
                console.log('error: ', err);
                return res.negotiate(err);
            }

            if (!user) {
                sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
                return res.view('homepage');
            }

            return res.view('signout', {
                me: {
                    username: user.username,
                    gravatarURL: user.gravatarURL,
                    admin: user.admin
                }
            });
        });
    },
    index: function (req,res){

        res.writeHead(200, {'content-type': 'text/html'});
        res.end(
            '<form action="http://localhost:1339/file/upload" enctype="multipart/form-data" method="post">'+
            '<input type="text" name="title"><br>'+
            '<input type="file" name="avatar" multiple="multiple"><br>'+
            '<input type="submit" value="Upload">'+
            '</form>'
        )
    },
    showHomePage: function (req, res) {
        var user ={'id':1};
        req.session.me = user.id;
        return res.view({
            me: user
        });
    },

    showAdminPage: function (req, res) {

        if (!req.session.me) {
            return res.view('public/header', {layout: 'homepage', me: null});
        }

        User.findOne(req.session.me, function (err, user) {

            if (err) {
                return res.negotiate(err);
            }

            if (!user) {
                sails.log.verbose('Сеанс относится к пользователю, который больше не существует, удалил ли пользователь, а затем попытался обновить страницу с открытой вкладкой, вошедшей в систему под этим пользователем?');
                return res.view('public/header', {layout: 'homepage', me: null});
            }

            // if (!user.admin) return res.backToHomePage();
            if (!user.admin) {
                req.session.me = user.id;
                return res.forbidden("Нет прав для просмотра данной страницы.");
            }

            user.fullName = user.lastName + ' ' + user.firstName + ' ' + user.patronymicName;
            return res.view({me: user});
            //return res.view( {
            //    me: {
            //        id: user.id,
            //        firstName: user.firstName,
            //        lastName: user.lastName,
            //        patronymicName: user.patronymicName,
            //        birthday: user.birthday,
            //        email: user.email,
            //        login: user.login,
            //        subdivision: user.subdivision,
            //        admin: user.admin,
            //        kadr: user.kadr,
            //        gravatarUrl: user.gravatarUrl,
            //        lastLoggedIn: user.lastLoggedIn,
            //        fullName: user.lastName + ' ' + user.firstName + ' ' + user.patronymicName
            //    }
            //});


            // return res.forbidden("У Вас нет прав для просмотра данной страницы, " +
            //     "пожалуйста свяжитесь с администратором: apetrov@landata.ru");

            // return res.view({
            //     me: {
            //         id: user.id,
            //         firstName: user.firstName,
            //         lastName: user.lastName,
            //         patronymicName: user.patronymicName,
            //         birthday: user.birthday,
            //         email: user.email,
            //         login: user.login,
            //         subdivision: user.subdivision,
            //         admin: user.admin,
            //         gravatarUrl: user.gravatarUrl,
            //         lastLoggedIn: user.lastLoggedIn,
            //         fullName: user.lastName + ' ' + user.firstName + ' ' + user.patronymicName
            //     }
            // });


        });
    },

    getEditUserPage: function (req, res) {

        if (!req.session.me) {
            return res.view('public/header', {layout: 'homepage', me: null});
        }

        User.findOne(req.session.me, function (err, user) {

            if (err) {
                return res.negotiate(err);
            }

            if (!user) {
                sails.log.verbose('Сеанс относится к пользователю, который больше не существует, удалил ли пользователь, а затем попытался обновить страницу с открытой вкладкой, вошедшей в систему под этим пользователем?');
                return res.view('public/header', {layout: 'homepage', me: null});
            }

            // if (!user.admin) return res.backToHomePage();
            if (!user.admin) {
                req.session.me = user.id;
                return res.forbidden("Нет прав для просмотра данной страницы.");
            }

            user.fullName = user.lastName + ' ' + user.firstName + ' ' + user.patronymicName;
            return res.view('page/showhomepage', {me: user});
        });
    },

    getExitUserPage: function (req, res) {

        if (!req.session.me) {
            return res.view('public/header', {layout: 'homepage', me: null});
        }

        User.findOne(req.session.me, function (err, user) {

            if (err) {
                return res.negotiate(err);
            }

            if (!user) {
                sails.log.verbose('Сеанс относится к пользователю, который больше не существует, удалил ли пользователь, а затем попытался обновить страницу с открытой вкладкой, вошедшей в систему под этим пользователем?');
                return res.view('public/header', {layout: 'homepage', me: null});
            }

            // if (!user.admin) return res.backToHomePage();
            if (!user.leader && !user.admin) {
                req.session.me = user.id;
                return res.forbidden("Нет прав для просмотра данной страницы.");
            }

            user.fullName = user.lastName + ' ' + user.firstName + ' ' + user.patronymicName;
            return res.view('page/showhomepage', {me: user});
        });
    },

    getListUserPage: function (req, res) {

        if (!req.session.me) {
            return res.view('public/header', {layout: 'homepage', me: null});
        }

        User.findOne(req.session.me, function (err, user) {

            if (err) {
                return res.negotiate(err);
            }

            if (!user) {
                sails.log.verbose('Сеанс относится к пользователю, который больше не существует, удалил ли пользователь, а затем попытался обновить страницу с открытой вкладкой, вошедшей в систему под этим пользователем?');
                return res.view('public/header', {layout: 'homepage', me: null});
            }

            // if (!user.admin) return res.backToHomePage();
            if (!user.admin && !user.kadr) {
                req.session.me = user.id;
                return res.forbidden("Нет прав для просмотра данной страницы.");
            }

            user.fullName = user.lastName + ' ' + user.firstName + ' ' + user.patronymicName;
            return res.view('page/showhomepage', {me: user});
        });
    },

    passwordRecoveryEmail: function (req, res) {
        return res.view('public/password-recovery-email', {layout: 'signup', me: null});
    },

    passwordRecoveryEmailSent: function (req, res) {
        return res.view('public/password-recovery-email-sent', {layout: 'signup', me: null});
    },

    passwordReset: function (req, res) {
        res.view('public/password-reset', {
            layout: 'signup',
            me: null,
            passwordRecoveryToken: req.param('passwordRecoveryToken')
        });
    },

    profile: function (req, res) {

        var FAKE_DATA = {
            frontEnd: {
                numOfTutorials: 11,
                numOfFollowers: 0,
                numOfFollowing: 0
            },
            tutorials: [{
                id: 1,
                title: 'The best of Douglas Crockford on JavaScript.',
                description: 'Understanding JavasScript the good parts.',
                owner: 'sailsinaction',
                averageRating: 3,
                created: 'a few seconds ago',
                totalTime: '1h 2m 3s'
            }, {
                id: 2,
                title: 'Understanding Angular 2.0',
                description: 'Different sides of Angular 2.0',
                owner: 'sailsinaction',
                averageRating: 3,
                created: 'a few seconds ago',
                totalTime: '1h 2m 3s'
            }, {
                id: 3,
                title: 'Biology 101.',
                description: 'The best biology teacher on the planet.',
                owner: 'sailsinaction',
                averageRating: 3,
                created: 'a few seconds ago',
                totalTime: '1h 2m 3s'
            }, {
                id: 4,
                title: 'Dog Training.',
                description: 'A great series on getting your dog to stop biting, sit, come, and stay.',
                owner: 'sailsinaction',
                averageRating: 3,
                created: 'a few seconds ago',
                totalTime: '1h 2m 3s'
            }, {
                id: 5,
                title: 'How to play famous songs on the Ukulele.',
                description: 'You\'ll learn songs like Love me Tender, Sea of Love, and more.',
                owner: 'sailsinaction',
                averageRating: 3,
                created: 'a few seconds ago',
                totalTime: '1h 2m 3s'
            }, {
                id: 6,
                title: 'Character development 101.',
                description: 'Writing better and more interesting characters.',
                owner: 'sailsinaction',
                averageRating: 3,
                created: 'a few seconds ago',
                totalTime: '1h 2m 3s'
            }, {
                id: 7,
                title: 'Drawing Cartoons.',
                description: 'Drawing techniques for the beginning cartoonist.',
                owner: 'sailsinaction',
                averageRating: 3,
                created: 'a few seconds ago',
                totalTime: '1h 2m 3s'
            }, {
                id: 8,
                title: 'How to make whisky.',
                description: 'Distilling corn into whisky.',
                owner: 'sailsinaction',
                averageRating: 3,
                created: 'a few seconds ago',
                totalTime: '1h 2m 3s'
            }, {
                id: 9,
                title: 'How do toilets work.',
                description: 'Everything you never thought you needed to know about how toilets flush.',
                owner: 'sailsinaction',
                averageRating: 3,
                created: 'a few seconds ago',
                totalTime: '1h 2m 3s'
            }, {
                id: 10,
                title: 'Making fire.',
                description: 'Techniques for making fire without a match.',
                owner: 'sailsinaction',
                averageRating: 3,
                created: 'a few seconds ago',
                totalTime: '1h 2m 3s'
            }, {
                id: 11,
                title: 'Making homemade beef jerky.',
                description: 'Everything you need to know to make some jerky.',
                owner: 'sailsinaction',
                averageRating: 3,
                created: 'a few seconds ago',
                totalTime: '1h 2m 3s'
            }]
        };

        // Look up the user record for the `username` parameter
        User.findOne({
            login: req.param('login')
        }).exec(function (err, foundByUsername) {
            if (err) {
                return res.negotiate(err);
            }

            // If no user exists with the username specified in the URL,
            // show the 404 page.
            if (!foundByUsername) {
                return res.notFound();
            }

            // The logged out case
            if (!req.session.me) {

                return res.view('profile', {
                    // This is for the navigation bar
                    me: null,

                    // This is for profile body
                    username: foundByUsername.username,
                    gravatarURL: foundByUsername.gravatarURL,
                    frontEnd: {
                        numOfTutorials: FAKE_DATA.frontEnd.numOfTutorials,
                        numOfFollowers: FAKE_DATA.frontEnd.numOfFollowers,
                        numOfFollowing: FAKE_DATA.frontEnd.numOfFollowing
                    },
                    // This is for the list of tutorials
                    tutorials: FAKE_DATA.tutorials
                });
            }

            // Otherwise the user-agent IS logged in.

            // Look up the logged-in user from the database.
            User.findOne({
                    id: req.session.me
                })
                .exec(function (err, foundUser) {
                    if (err) {
                        return res.negotiate(err);
                    }

                    if (!foundUser) {
                        return res.serverError('User record from logged in user is missing?');
                    }

                    // We'll provide `me` as a local to the profile page view.
                    // (this is so we can render the logged-in navbar state, etc.)
                    var me = {
                        login: foundUser.login,
                        email: foundUser.email,
                        gravatarURL: foundUser.gravatarURL,
                        admin: foundUser.admin
                    };

                    // We'll provide the `isMe` flag to the profile page view
                    // if the logged-in user is the same as the user whose profile we looked up earlier.
                    if (req.session.me === foundByUsername.id) {
                        me.isMe = true;
                    } else {
                        me.isMe = false;
                    }

                    // Return me property for the nav and the remaining properties for the profile page.
                    return res.view('profile', {
                        me: me,
                        showAddTutorialButton: true,
                        username: foundByUsername.username,
                        gravatarURL: foundByUsername.gravatarURL,
                        frontEnd: {
                            numOfTutorials: FAKE_DATA.frontEnd.numOfTutorials,
                            numOfFollowers: FAKE_DATA.frontEnd.numOfFollowers,
                            numOfFollowing: FAKE_DATA.frontEnd.numOfFollowing,
                            followedByLoggedInUser: true
                        },
                        tutorials: FAKE_DATA.tutorials
                    });
                }); //</ User.findOne({id: req.session.userId})

        });
    },

    showVideosPage: function (req, res) {

        if (!req.session.me) {
            return res.view('videos', {
                me: null
            });
        }

        User.findOne(req.session.me, function (err, user) {
            if (err) {
                return res.negotiate(err);
            }

            if (!user) {
                sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
                return res.view('videos', {
                    me: null
                });
            }

            return res.view('videos', {
                me: {
                    id: user.id,
                    email: user.email,
                    gravatarURL: user.gravatarURL,
                    admin: user.admin
                }
            });
        });
    },

    showEditProfilePage: function (req, res) {

        if (!req.session.me) {
            return res.redirect('/');
        }

        User.findOne(req.session.me, function (err, user) {
            if (err) {
                console.log('error: ', error);
                return res.negotiate(err);
            }

            if (!user) {
                sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
                return res.view('homepage');
            }

            return res.view('edit-profile', {
                me: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    gravatarURL: user.gravatarURL,
                    admin: user.admin
                }
            });
        });
    },

    showRestorePage: function (req, res) {
        if (req.session.me) {
            return res.redirect('/');
        }

        return res.view('restore-profile', {
            me: null
        });
    },

    showSignupPage: function (req, res) {
        if (req.session.me) {
            return res.redirect('/');
        }
        return res.view('public/signup', {layout: 'signup'});
    },

    restoreProfile: function (req, res) {
        return res.view('public/restore', {layout: 'homepage'});
        // return res.view('restore-profile', {
        //     me: null
        // });
    }


};


