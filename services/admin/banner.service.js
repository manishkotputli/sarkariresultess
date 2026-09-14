'use strict';

const repo = require('../../repositories/admin/banner.repository');


/*
|--------------------------------------------------------------------------
| GET BANNERS
|--------------------------------------------------------------------------
*/

async function getList(filters = {}) {

  /*
   * Backward compatibility:
   *
   * If old code sends:
   * service.getList('something')
   *
   * it will still work.
   */

  if (typeof filters === 'string') {

    filters = {
      search: filters,
    };

  }


  const search =
    typeof filters.search === 'string'
      ? filters.search.trim()
      : '';

  const status =
    typeof filters.status === 'string'
      ? filters.status.trim().toLowerCase()
      : '';

  const sort =
    typeof filters.sort === 'string'
      ? filters.sort.trim().toLowerCase()
      : '';


  return repo.list({
    search,
    status,
    sort,
  });

}


/*
|--------------------------------------------------------------------------
| CREATE BANNER
|--------------------------------------------------------------------------
*/

async function createBanner(body, file) {

  const imagePath =
    file
      ? `/uploads/banner/${file.filename}`
      : null;


  /*
   * Validation:
   * At least Text OR Image should exist
   */

  if (!body.text && !imagePath) {

    const err =
      new Error(
        'Either Banner text or an Image is required.'
      );

    err.status = 400;

    throw err;

  }


  return repo.create({

    text:
      body.text
        ? body.text.trim()
        : null,

    url:
      body.url
        ? body.url.trim()
        : null,

    color:
      body.color
        ? body.color.trim()
        : null,

    image:
      imagePath,

    status:
      body.status === 'on' ||
      body.status === 'true' ||
      body.status === '1' ||
      body.status === true,

  });

}


/*
|--------------------------------------------------------------------------
| UPDATE BANNER
|--------------------------------------------------------------------------
*/

async function updateBanner(id, body, file) {

  const banner =
    await repo.findById(id);


  if (!banner) {

    const err =
      new Error('Banner not found');

    err.status = 404;

    throw err;

  }


  /*
   * New image if uploaded,
   * otherwise keep old image
   */

  const imagePath =
    file
      ? `/uploads/banner/${file.filename}`
      : banner.image;


  /*
   * Validation
   */

  if (!body.text && !imagePath) {

    const err =
      new Error(
        'Either Banner text or an Image is required.'
      );

    err.status = 400;

    throw err;

  }


  return repo.update(
    banner,
    {

      text:
        body.text
          ? body.text.trim()
          : null,

      url:
        body.url
          ? body.url.trim()
          : null,

      color:
        body.color
          ? body.color.trim()
          : null,

      image:
        imagePath,

      status:
        body.status === 'on' ||
        body.status === 'true' ||
        body.status === '1' ||
        body.status === true,

    }
  );

}


/*
|--------------------------------------------------------------------------
| DELETE BANNER
|--------------------------------------------------------------------------
*/

async function deleteBanner(id) {

  const banner =
    await repo.findById(id);


  if (!banner) {

    const err =
      new Error('Banner not found');

    err.status = 404;

    throw err;

  }


  return repo.destroy(banner);

}


/*
|--------------------------------------------------------------------------
| TOGGLE STATUS
|--------------------------------------------------------------------------
*/

async function toggleStatus(id) {

  const banner =
    await repo.findById(id);


  if (!banner) {

    const err =
      new Error('Banner not found');

    err.status = 404;

    throw err;

  }


  banner.status =
    !banner.status;


  await banner.save();


  return banner;

}


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {

  getList,

  createBanner,

  updateBanner,

  deleteBanner,

  toggleStatus,

};