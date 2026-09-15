'use strict';

const service = require('../../services/admin/blogCategory.service');


/*
|--------------------------------------------------------------------------
| Blog Categories List
|--------------------------------------------------------------------------
*/

async function index(req, res, next) {
    try {

        const search =
            (req.query.search || '').trim();

        const categories =
            await service.getList(search);

        res.render('admin/blog-categories/index', {
            title: 'Blog Categories',
            active: 'blog-categories',
            categories,
            search
        });

    } catch (err) {
        next(err);
    }
}


/*
|--------------------------------------------------------------------------
| Create Form
|--------------------------------------------------------------------------
*/

async function createForm(req, res, next) {
    try {

        res.render('admin/blog-categories/form', {
            title: 'Add Blog Category',
            active: 'blog-categories',
            mode: 'create',

            formAction: '/admin/blog-categories',

            category: {
                name: '',
                slug: ''
            }
        });

    } catch (err) {
        next(err);
    }
}


/*
|--------------------------------------------------------------------------
| Edit Form
|--------------------------------------------------------------------------
*/

async function editForm(req, res, next) {
    try {

        const category =
            await service.getById(req.params.id);

        if (!category) {

            req.flash(
                'error',
                'Blog category not found.'
            );

            return res.redirect(
                '/admin/blog-categories'
            );
        }

        res.render('admin/blog-categories/form', {
            title: 'Edit Blog Category',
            active: 'blog-categories',
            mode: 'edit',

            formAction:
                `/admin/blog-categories/${category.id}/update`,

            category
        });

    } catch (err) {
        next(err);
    }
}


/*
|--------------------------------------------------------------------------
| Store
|--------------------------------------------------------------------------
*/

async function store(req, res, next) {
    try {

        await service.createCategory(req.body);

        req.flash(
            'success',
            'Blog category created successfully.'
        );

        return res.redirect(
            '/admin/blog-categories'
        );

    } catch (err) {

        if (err.status === 400) {

            req.flash(
                'error',
                err.message
            );

            return res.redirect(
                '/admin/blog-categories'
            );
        }

        next(err);
    }
}


/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

async function update(req, res, next) {
    try {

        await service.updateCategory(
            req.params.id,
            req.body
        );

        req.flash(
            'success',
            'Blog category updated successfully.'
        );

        return res.redirect(
            '/admin/blog-categories'
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
                '/admin/blog-categories'
            );
        }

        next(err);
    }
}


/*
|--------------------------------------------------------------------------
| Delete
|--------------------------------------------------------------------------
*/

async function destroy(req, res, next) {
    try {

        await service.deleteCategory(
            req.params.id
        );

        req.flash(
            'success',
            'Blog category deleted successfully.'
        );

        return res.redirect(
            '/admin/blog-categories'
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
                '/admin/blog-categories'
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
    destroy
};