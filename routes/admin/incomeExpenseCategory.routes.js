'use strict';

const express = require('express');

const router =
    express.Router();


const controller =
    require(
        '../../controllers/admin/incomeExpenseCategory.controller'
    );


const {
    isAdminAuthenticated
} =
    require(
        '../../middlewares/adminAuth'
    );


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.use(
    isAdminAuthenticated
);


/*
|--------------------------------------------------------------------------
| Categories
|--------------------------------------------------------------------------
*/


// All categories

router.get(
    '/income-expense/categories',
    controller.index
);


// Add category page

router.get(
    '/income-expense/categories/create',
    controller.createForm
);


// Store category

router.post(
    '/income-expense/categories',
    controller.store
);


// Edit category page

router.get(
    '/income-expense/categories/:id/edit',
    controller.editForm
);


// Update category

router.post(
    '/income-expense/categories/:id/update',
    controller.update
);


// Delete category

router.post(
    '/income-expense/categories/:id/delete',
    controller.destroy
);


module.exports = router;