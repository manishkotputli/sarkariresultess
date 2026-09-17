'use strict';

const repo = require(
    '../../repositories/admin/incomeExpenseCategory.repository'
);


/*
|--------------------------------------------------------------------------
| TYPE LABEL
|--------------------------------------------------------------------------
*/

function getTypeLabel(type) {

    return Number(type) === 1
        ? 'Income'
        : 'Expense';

}


/*
|--------------------------------------------------------------------------
| VALIDATE TYPE
|--------------------------------------------------------------------------
*/

function validateType(type) {

    const value = Number(type);

    if (![1, 2].includes(value)) {

        const err = new Error(
            'Invalid category type.'
        );

        err.status = 400;

        throw err;

    }

    return value;

}


/*
|--------------------------------------------------------------------------
| NORMALIZE NAME
|--------------------------------------------------------------------------
*/

function normalizeName(name) {

    return String(name || '')
        .trim()
        .replace(/\s+/g, ' ');

}


/*
|--------------------------------------------------------------------------
| GET LIST
|--------------------------------------------------------------------------
*/

async function getList(query, loggedInUserId) {

    const search =
        String(query.search || '').trim();

    const type =
        query.type || '';


    return repo.list({

        userId: loggedInUserId,

        search,

        type,

    });

}


/*
|--------------------------------------------------------------------------
| GET CATEGORY
|--------------------------------------------------------------------------
*/

async function getById(id, loggedInUserId) {

    const category = await repo.findById(
        id,
        loggedInUserId
    );


    if (!category) {

        const err = new Error(
            'Category not found.'
        );

        err.status = 404;

        throw err;

    }


    return category;

}


/*
|--------------------------------------------------------------------------
| CREATE CATEGORY
|--------------------------------------------------------------------------
*/

async function createCategory(
    body,
    loggedInUserId
) {

    const name =
        normalizeName(body.name);

    const type =
        validateType(body.type);


    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!name) {

        const err = new Error(
            'Category name is required.'
        );

        err.status = 400;

        throw err;

    }


    if (name.length > 150) {

        const err = new Error(
            'Category name cannot exceed 150 characters.'
        );

        err.status = 400;

        throw err;

    }


    /*
    |--------------------------------------------------------------------------
    | Duplicate Check
    |--------------------------------------------------------------------------
    */

    const existing =
        await repo.findDuplicate({

            userId: loggedInUserId,

            name,

            type,

        });


    if (existing) {

        const err = new Error(
            `A ${getTypeLabel(type).toLowerCase()} category named "${name}" already exists.`
        );

        err.status = 400;

        throw err;

    }


    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    return repo.create({

        user_id: Number(loggedInUserId),

        name,

        type,

    });

}


/*
|--------------------------------------------------------------------------
| UPDATE CATEGORY
|--------------------------------------------------------------------------
*/

async function updateCategory(
    id,
    body,
    loggedInUserId
) {

    /*
    |--------------------------------------------------------------------------
    | Ownership Check
    |--------------------------------------------------------------------------
    */

    const category =
        await repo.findById(
            id,
            loggedInUserId
        );


    if (!category) {

        const err = new Error(
            'Category not found.'
        );

        err.status = 404;

        throw err;

    }


    const name =
        normalizeName(body.name);

    const type =
        validateType(body.type);


    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!name) {

        const err = new Error(
            'Category name is required.'
        );

        err.status = 400;

        throw err;

    }


    if (name.length > 150) {

        const err = new Error(
            'Category name cannot exceed 150 characters.'
        );

        err.status = 400;

        throw err;

    }


    /*
    |--------------------------------------------------------------------------
    | Duplicate Check
    |--------------------------------------------------------------------------
    */

    const existing =
        await repo.findDuplicate({

            userId: loggedInUserId,

            name,

            type,

            excludeId: id,

        });


    if (existing) {

        const err = new Error(
            `A ${getTypeLabel(type).toLowerCase()} category named "${name}" already exists.`
        );

        err.status = 400;

        throw err;

    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    return repo.update(
        category,
        {
            name,
            type,
        }
    );

}


/*
|--------------------------------------------------------------------------
| DELETE CATEGORY
|--------------------------------------------------------------------------
*/

async function deleteCategory(
    id,
    loggedInUserId
) {

    /*
    |--------------------------------------------------------------------------
    | Ownership Check
    |--------------------------------------------------------------------------
    */

    const category =
        await repo.findById(
            id,
            loggedInUserId
        );


    if (!category) {

        const err = new Error(
            'Category not found.'
        );

        err.status = 404;

        throw err;

    }


    /*
    |--------------------------------------------------------------------------
    | Check Existing Transactions
    |--------------------------------------------------------------------------
    */

    const entryCount =
        await repo.countEntries(
            id,
            loggedInUserId
        );


    if (entryCount > 0) {

        const err = new Error(
            `Cannot delete "${category.name}" because it is used by ${entryCount} transaction(s).`
        );

        err.status = 400;

        throw err;

    }


    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    return repo.destroy(category);

}


/*
|--------------------------------------------------------------------------
| SELECT OPTIONS
|--------------------------------------------------------------------------
*/

async function allForSelect(
    loggedInUserId,
    type = ''
) {

    return repo.allForSelect(
        loggedInUserId,
        type
    );

}


module.exports = {

    getList,
    getById,
    createCategory,
    updateCategory,
    deleteCategory,
    allForSelect,

};