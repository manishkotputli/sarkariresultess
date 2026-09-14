'use strict';

const db =
  require('../../models');

const {
  Op
} =
  require('sequelize');


/*
|--------------------------------------------------------------------------
| LIST BANNERS
|--------------------------------------------------------------------------
|
| Supports:
|
| search
| status
| sort
|
|--------------------------------------------------------------------------
*/

async function list(filters = {}) {

  const {

    search = '',

    status = '',

    sort = '',

  } = filters;


  /*
   * WHERE
   */

  const where = {};


  /*
   * SEARCH
   *
   * Search in:
   * text
   * url
   * color
   */

  if (search) {

    where[Op.or] = [

      {
        text: {
          [Op.like]: `%${search}%`
        }
      },

      {
        url: {
          [Op.like]: `%${search}%`
        }
      },

      {
        color: {
          [Op.like]: `%${search}%`
        }
      },

    ];

  }


  /*
   * STATUS FILTER
   */

  if (status === 'active') {

    where.status = true;

  }


  if (status === 'inactive') {

    where.status = false;

  }


  /*
   * SORT
   */

  let order;


  switch (sort) {


    /*
     * TEXT A-Z
     */

    case 'text_asc':

      order = [

        ['text', 'ASC'],

        ['id', 'DESC'],

      ];

      break;


    /*
     * TEXT Z-A
     */

    case 'text_desc':

      order = [

        ['text', 'DESC'],

        ['id', 'DESC'],

      ];

      break;


    /*
     * NEWEST
     */

    case 'newest':

      order = [

        ['id', 'DESC'],

      ];

      break;


    /*
     * OLDEST
     */

    case 'oldest':

      order = [

        ['id', 'ASC'],

      ];

      break;


    /*
     * DEFAULT
     */

    default:

      order = [

        ['id', 'DESC'],

      ];

      break;

  }


  /*
   * QUERY
   */

  return db.Banner.findAll({

    where,

    order,

  });

}


/*
|--------------------------------------------------------------------------
| FIND BY ID
|--------------------------------------------------------------------------
*/

async function findById(id) {

  return db.Banner.findByPk(id);

}


/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

async function create(data) {

  return db.Banner.create(data);

}


/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

async function update(
  banner,
  data
) {

  return banner.update(data);

}


/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

async function destroy(banner) {

  return banner.destroy();

}


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {

  list,

  findById,

  create,

  update,

  destroy,

};