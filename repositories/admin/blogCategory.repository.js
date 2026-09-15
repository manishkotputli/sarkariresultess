'use strict';

const db =
    require('../../models');

const {
    Op
} = require('sequelize');


/*
|--------------------------------------------------------------------------
| Get List
|--------------------------------------------------------------------------
*/

async function list(search = '') {

    const where = {};


    if (search) {

        where.name = {
            [Op.like]: `%${search}%`
        };

    }


    return db.BlogCategory.findAll({

        where,

        attributes: {

            include: [

                [
                    db.Sequelize.fn(
                        'COUNT',
                        db.Sequelize.col(
                            'Blogs.id'
                        )
                    ),
                    'blogCount'
                ]

            ]

        },

        include: [

            {
                model: db.Blog,
                attributes: []
            }

        ],

        group: [
            'BlogCategory.id'
        ],

        order: [
            [
                'name',
                'ASC'
            ]
        ]

    });

}


/*
|--------------------------------------------------------------------------
| Find By ID
|--------------------------------------------------------------------------
*/

async function findById(id) {

    return db.BlogCategory.findByPk(id);

}


/*
|--------------------------------------------------------------------------
| Find By Slug
|--------------------------------------------------------------------------
*/

async function findBySlug(
    slug,
    excludeId = null
) {

    const where = {
        slug
    };


    if (excludeId) {

        where.id = {
            [Op.ne]: excludeId
        };

    }


    return db.BlogCategory.findOne({
        where
    });

}


/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

async function create(data) {

    return db.BlogCategory.create(
        data
    );

}


/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

async function update(
    category,
    data
) {

    return category.update(
        data
    );

}


/*
|--------------------------------------------------------------------------
| Delete
|--------------------------------------------------------------------------
*/

async function destroy(category) {

    return category.destroy();

}


/*
|--------------------------------------------------------------------------
| Count Blogs
|--------------------------------------------------------------------------
*/

async function countBlogs(id) {

    return db.Blog.count({

        where: {
            category_id: id
        }

    });

}


/*
|--------------------------------------------------------------------------
| All Categories For Select
|--------------------------------------------------------------------------
*/

async function allForSelect() {

    return db.BlogCategory.findAll({

        order: [
            [
                'name',
                'ASC'
            ]
        ]

    });

}


module.exports = {

    list,
    findById,
    findBySlug,
    create,
    update,
    destroy,
    countBlogs,
    allForSelect

};