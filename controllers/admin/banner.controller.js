'use strict';

const service =
  require('../../services/admin/banner.service');


/*
|--------------------------------------------------------------------------
| INDEX
|--------------------------------------------------------------------------
*/

async function index(req, res, next) {

  try {

    /*
     * Search
     */

    const search =
      (req.query.search || '').trim();


    /*
     * Status
     *
     * Allowed:
     * active
     * inactive
     */

    const status =
      (req.query.status || '').trim().toLowerCase();


    /*
     * Sort
     */

    const sort =
      (req.query.sort || '').trim().toLowerCase();


    /*
     * Get banners
     */

    const banners =
      await service.getList({

        search,

        status,

        sort,

      });


    /*
     * Render
     */

    res.render(
      'admin/banners/index',
      {

        title: 'Banners',

        active: 'banners',

        banners,

        search,

        status,

        sort,

      }
    );


  } catch (err) {

    next(err);

  }

}


/*
|--------------------------------------------------------------------------
| STORE
|--------------------------------------------------------------------------
*/

async function store(req, res, next) {

  try {

    /*
     * Pass req.file alongside req.body
     */

    await service.createBanner(
      req.body,
      req.file
    );


    req.flash(
      'success',
      'Banner created successfully.'
    );


    res.redirect(
      '/admin/banners'
    );


  } catch (err) {

    if (err.status === 400) {

      req.flash(
        'error',
        err.message
      );


      return res.redirect(
        '/admin/banners'
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

async function update(req, res, next) {

  try {

    /*
     * Pass req.file alongside req.body
     */

    await service.updateBanner(
      req.params.id,
      req.body,
      req.file
    );


    req.flash(
      'success',
      'Banner updated successfully.'
    );


    res.redirect(
      '/admin/banners'
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
        '/admin/banners'
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

async function destroy(req, res, next) {

  try {

    await service.deleteBanner(
      req.params.id
    );


    req.flash(
      'success',
      'Banner deleted successfully.'
    );


    res.redirect(
      '/admin/banners'
    );


  } catch (err) {

    if (err.status === 404) {

      req.flash(
        'error',
        err.message
      );


      return res.redirect(
        '/admin/banners'
      );

    }


    next(err);

  }

}


/*
|--------------------------------------------------------------------------
| TOGGLE STATUS
|--------------------------------------------------------------------------
*/

async function toggleStatus(req, res, next) {

  try {

    await service.toggleStatus(
      req.params.id
    );


    /*
     * Keep current search/filter/sort URL
     */

    res.redirect(
      req.get('Referer') ||
      '/admin/banners'
    );


  } catch (err) {

    next(err);

  }

}


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {

  index,

  store,

  update,

  destroy,

  toggleStatus,

};