'use strict';

const categoryService = require(
    '../../services/admin/incomeExpenseCategory.service'
);


/*
|--------------------------------------------------------------------------
| INDEX
|--------------------------------------------------------------------------
*/

async function index(req, res, next) {

    try {

        const loggedInUserId =
            req.session.admin.id;


        const search =
            String(
                req.query.search || ''
            ).trim();


        const type =
            req.query.type || '';


        const categories =
            await categoryService.getList(
                req.query,
                loggedInUserId
            );


        res.render(
            'admin/income-expense-categories/index',
            {

                title: 'Income & Expense Categories',

                active: 'income-expense-categories',

                categories,

                filters: {

                    search,

                    type,

                },

            }
        );


    } catch (err) {

        next(err);

    }

}


/*
|--------------------------------------------------------------------------
| CREATE FORM
|--------------------------------------------------------------------------
*/

async function createForm(
    req,
    res,
    next
) {

    try {

        res.render(
            'admin/income-expense-categories/form',
            {

                title: 'Add Income & Expense Category',

                active: 'income-expense-categories',

                mode: 'create',

                formAction:
                    '/admin/income-expense/categories',

                category: {

                    name: '',

                    type: 1,

                },

            }
        );


    } catch (err) {

        next(err);

    }

}


/*
|--------------------------------------------------------------------------
| EDIT FORM
|--------------------------------------------------------------------------
*/

async function editForm(
    req,
    res,
    next
) {

    try {

        const loggedInUserId =
            req.session.admin.id;


        const category =
            await categoryService.getById(
                req.params.id,
                loggedInUserId
            );


        res.render(
            'admin/income-expense-categories/form',
            {

                title: 'Edit Income & Expense Category',

                active: 'income-expense-categories',

                mode: 'edit',

                formAction:
                    `/admin/income-expense/categories/${category.id}/update`,

                category,

            }
        );


    } catch (err) {

        if (err.status === 404) {

            req.flash(
                'error',
                err.message
            );

            return res.redirect(
                '/admin/income-expense/categories'
            );

        }


        next(err);

    }

}


/*
|--------------------------------------------------------------------------
| STORE
|--------------------------------------------------------------------------
*/

async function store(
    req,
    res,
    next
) {

    try {

        const loggedInUserId =
            req.session.admin.id;


        await categoryService.createCategory(
            req.body,
            loggedInUserId
        );


        req.flash(
            'success',
            'Category created successfully.'
        );


        res.redirect(
            '/admin/income-expense/categories'
        );


    } catch (err) {

        if (err.status === 400) {

            req.flash(
                'error',
                err.message
            );


            return res.redirect(
                '/admin/income-expense/categories/create'
            );

        }


        next(err);

    }

}


/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

async function update(
    req,
    res,
    next
) {

    try {

        const loggedInUserId =
            req.session.admin.id;


        await categoryService.updateCategory(
            req.params.id,
            req.body,
            loggedInUserId
        );


        req.flash(
            'success',
            'Category updated successfully.'
        );


        res.redirect(
            '/admin/income-expense/categories'
        );


    } catch (err) {

        if (
            err.status === 400 ||
            err.status === 404
        ) {

            req.flash(
                'error',
                err.message
            );


            return res.redirect(
                '/admin/income-expense/categories'
            );

        }


        next(err);

    }

}


/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

async function destroy(
    req,
    res,
    next
) {

    try {

        const loggedInUserId =
            req.session.admin.id;


        await categoryService.deleteCategory(
            req.params.id,
            loggedInUserId
        );


        req.flash(
            'success',
            'Category deleted successfully.'
        );


        res.redirect(
            '/admin/income-expense/categories'
        );


    } catch (err) {

        if (
            err.status === 400 ||
            err.status === 404
        ) {

            req.flash(
                'error',
                err.message
            );


            return res.redirect(
                '/admin/income-expense/categories'
            );

        }


        next(err);

    }

}


module.exports = {

    index,
    createForm,
    editForm,
    store,
    update,
    destroy,

};