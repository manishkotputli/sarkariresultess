'use strict';

const { validationResult } = require('express-validator');
const authService = require('../../services/admin/auth.service');


/*
|--------------------------------------------------------------------------
| Show Login
|--------------------------------------------------------------------------
*/

function showLogin(req, res) {

    res.render('admin/auth/login', {
        title: 'Admin Login',
        layout: false
    });

}


/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

async function login(req, res, next) {

    try {

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            req.flash(
                'error',
                errors.array()[0].msg
            );

            return res.redirect('/admin/login');

        }


        /*
        |--------------------------------------------------------------------------
        | Login Credentials
        |--------------------------------------------------------------------------
        */

        const { email, password } = req.body;

        let user;


        /*
        |--------------------------------------------------------------------------
        | Authenticate User
        |--------------------------------------------------------------------------
        */

        try {

            user = await authService.login(
                email,
                password
            );

        } catch (err) {

            if (err.status === 403) {

                req.flash(
                    'error',
                    err.message
                );

                return res.redirect(
                    '/admin/login'
                );

            }

            throw err;

        }


        /*
        |--------------------------------------------------------------------------
        | Invalid Login
        |--------------------------------------------------------------------------
        */

        if (!user) {

            req.flash(
                'error',
                'Invalid email or password.'
            );

            return res.redirect(
                '/admin/login'
            );

        }


        /*
        |--------------------------------------------------------------------------
        | ADMIN SESSION
        |--------------------------------------------------------------------------
        */

        req.session.admin = {

            id: user.id,

            name: user.name,

            email: user.email,

            user_code: user.user_code,

            avatar: user.profile_photo,

            role: user.Role
                ? user.Role.name
                : null,

            role_prefix: user.Role
                ? user.Role.prefix
                : null

        };


        /*
        |--------------------------------------------------------------------------
        | SAVE SESSION FIRST
        |--------------------------------------------------------------------------
        |
        | Important:
        | Session save hone ke baad hi dashboard redirect hoga.
        |
        */

        req.session.save(function (err) {

            if (err) {

                return next(err);

            }


            /*
            |--------------------------------------------------------------------------
            | FORCE ADMIN DASHBOARD
            |--------------------------------------------------------------------------
            */

            return res.redirect(
                '/admin/dashboard'
            );

        });

    } catch (err) {

        next(err);

    }

}


/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

function logout(req, res) {

    delete req.session.admin;

    req.session.save(function (err) {

        if (err) {
            return res.redirect('/admin/login');
        }

        return res.redirect(
            '/admin/login'
        );

    });

}


module.exports = {
    showLogin,
    login,
    logout
};