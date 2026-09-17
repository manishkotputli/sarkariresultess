'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/blogCategory.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.use(isAdminAuthenticated);

router.get('/blog-categories', controller.index);
router.get('/blog-categories/create', controller.createForm);
router.post('/blog-categories', controller.store);
router.get(
    '/blog-categories/:id/edit',
    controller.editForm
);router.post('/blog-categories/:id/update', controller.update);
router.post('/blog-categories/:id/delete', controller.destroy);

module.exports = router;
