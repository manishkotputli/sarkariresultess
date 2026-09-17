'use strict';

const db = require('../../models');
const { Op } = require('sequelize');


/*
|--------------------------------------------------------------------------
| LIST CATEGORIES
|--------------------------------------------------------------------------
*/

async function list({
    userId,
    search = '',
    type = '',
} = {}) {

    const where = {
        user_id: Number(userId),
    };


    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    if (search) {

        where.name = {
            [Op.like]: `%${search}%`,
        };

    }


    /*
    |--------------------------------------------------------------------------
    | Type
    |--------------------------------------------------------------------------
    */

    if (type) {

        where.type = Number(type);

    }


    return db.IncomeExpenseCategory.findAll({

        where,

        include: [
            {
                model: db.User,

                attributes: [
                    'id',
                    'name',
                    'email',
                ],
            },
        ],

        order: [
            ['type', 'ASC'],
            ['name', 'ASC'],
            ['id', 'DESC'],
        ],

    });

}


/*
|--------------------------------------------------------------------------
| FIND BY ID + USER
|--------------------------------------------------------------------------
| IMPORTANT:
| User ID is always included.
| This prevents accessing another user's category.
|--------------------------------------------------------------------------
*/

async function findById(id, userId) {

    return db.IncomeExpenseCategory.findOne({

        where: {
            id: Number(id),
            user_id: Number(userId),
        },

        include: [
            {
                model: db.User,

                attributes: [
                    'id',
                    'name',
                    'email',
                ],
            },
        ],

    });

}


/*
|--------------------------------------------------------------------------
| FIND DUPLICATE
|--------------------------------------------------------------------------
*/

async function findDuplicate({
    userId,
    name,
    type,
    excludeId = null,
}) {

    const where = {

        user_id: Number(userId),

        name: {
            [Op.eq]: name,
        },

        type: Number(type),

    };


    if (excludeId) {

        where.id = {
            [Op.ne]: Number(excludeId),
        };

    }


    return db.IncomeExpenseCategory.findOne({
        where,
    });

}


/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

async function create(data) {

    return db.IncomeExpenseCategory.create(data);

}


/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

async function update(category, data) {

    return category.update(data);

}


/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

async function destroy(category) {

    return category.destroy();

}


/*
|--------------------------------------------------------------------------
| COUNT USED TRANSACTIONS
|--------------------------------------------------------------------------
*/

async function countEntries(categoryId, userId) {

    return db.IncomeExpense.count({

        where: {

            category_id: Number(categoryId),

            user_id: Number(userId),

        },

    });

}


/*
|--------------------------------------------------------------------------
| ALL CATEGORIES FOR SELECT
|--------------------------------------------------------------------------
| Used by Income / Expense form.
|--------------------------------------------------------------------------
*/

async function allForSelect(userId, type = '') {

    const where = {

        user_id: Number(userId),

    };


    if (type) {

        where.type = Number(type);

    }


    return db.IncomeExpenseCategory.findAll({

        where,

        attributes: [
            'id',
            'name',
            'type',
        ],

        order: [
            ['type', 'ASC'],
            ['name', 'ASC'],
        ],

    });

}


module.exports = {

    list,
    findById,
    findDuplicate,
    create,
    update,
    destroy,
    countEntries,
    allForSelect,

};