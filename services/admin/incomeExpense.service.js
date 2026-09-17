'use strict';

const repo = require('../../repositories/admin/incomeexpense.repository');

const PER_PAGE = 15;
const BANKS_PER_PAGE = 8;


function toBool(v) {

  return (
    v === 'on' ||
    v === 'true' ||
    v === '1' ||
    v === true
  );

}


/*
|--------------------------------------------------------------------------
| LIST
|--------------------------------------------------------------------------
*/

async function getList(query = {}, loggedInUserId) {

  const userId = Number(loggedInUserId);

  if (!userId) {
    throw new Error('Authenticated user not found.');
  }

  const page =
    parseInt(query.page, 10) || 1;

  const bankPage =
    parseInt(query.bank_page, 10) || 1;


  const [
    { entries, total },
    stats,
    { banks, total: banksTotal },
    allBanks,
    allCategories,
  ] = await Promise.all([

    repo.list({
      search: query.search || '',
      type: query.type || '',
      userId,
      page,
      perPage: PER_PAGE,
    }),

    repo.getStats(userId),

    repo.listBanks({
      userId,
      page: bankPage,
      perPage: BANKS_PER_PAGE,
    }),

    repo.allBanksForSelect(userId),

    repo.allCategoriesForSelect(userId),

  ]);


  return {

    entries,
    total,

    page,
    perPage: PER_PAGE,

    stats,

    banks,
    banksTotal,

    bankPage,
    banksPerPage: BANKS_PER_PAGE,

    /*
     * Current user only.
     */
    users: [
      {
        id: userId,
        name: 'My Account',
      },
    ],

    allBanks,
    allCategories,

  };

}


/*
|--------------------------------------------------------------------------
| ADD INCOME / EXPENSE
|--------------------------------------------------------------------------
*/

async function addEntry(body, loggedInUserId) {

  const userId =
    Number(loggedInUserId);


  if (!userId) {

    const err =
      new Error('Authenticated user not found.');

    err.status = 400;

    throw err;

  }


  if (
    !body.category_id ||
    !body.type ||
    !body.title ||
    !body.amount ||
    !body.transaction_date
  ) {

    const err =
      new Error(
        'Category, type, title, amount and date are all required.'
      );

    err.status = 400;

    throw err;

  }


  const amount =
    parseFloat(body.amount);


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    const err =
      new Error(
        'Amount must be greater than 0.'
      );

    err.status = 400;

    throw err;

  }


  if (
    ![1, 2].includes(
      Number(body.type)
    )
  ) {

    const err =
      new Error(
        'Invalid transaction type.'
      );

    err.status = 400;

    throw err;

  }


  /*
   * Verify category belongs to current user.
   */

  const category =
    await repo.findCategoryForUser(
      body.category_id,
      userId
    );


  if (!category) {

    const err =
      new Error(
        'Invalid category.'
      );

    err.status = 400;

    throw err;

  }


  /*
   * Optional bank.
   * If supplied, it MUST belong to current user.
   */

  let bankId = null;


  if (body.bank_id) {

    const bank =
  await repo.findBankByIdForUser(
    body.bank_id,
    userId
  );


    if (!bank) {

      const err =
        new Error(
          'Invalid bank/account.'
        );

      err.status = 400;

      throw err;

    }


    bankId =
      Number(body.bank_id);

  }


  return repo.createEntry({

    /*
     * NEVER use body.user_id
     */
    user_id: userId,

    category_id:
      Number(body.category_id),

    bank_id:
      bankId,

    type:
      Number(body.type),

    title:
      body.title.trim(),

    amount,

    note:
      body.note
        ? body.note.trim()
        : null,

    transaction_date:
      body.transaction_date,

  });

}


/*
|--------------------------------------------------------------------------
| UPDATE INCOME / EXPENSE
|--------------------------------------------------------------------------
*/

async function editEntry(
  id,
  body,
  loggedInUserId
) {

  const userId =
    Number(loggedInUserId);


  const entry =
    await repo.findEntryByIdForUser(
      id,
      userId
    );


  if (!entry) {

    const err =
      new Error('Entry not found.');

    err.status = 404;

    throw err;

  }


  if (
    !body.category_id ||
    !body.type ||
    !body.title ||
    !body.amount ||
    !body.transaction_date
  ) {

    const err =
      new Error(
        'Category, type, title, amount and date are all required.'
      );

    err.status = 400;

    throw err;

  }


  const amount =
    parseFloat(body.amount);


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    const err =
      new Error(
        'Amount must be greater than 0.'
      );

    err.status = 400;

    throw err;

  }


  if (
    ![1, 2].includes(
      Number(body.type)
    )
  ) {

    const err =
      new Error(
        'Invalid transaction type.'
      );

    err.status = 400;

    throw err;

  }


  const category =
    await repo.findCategoryForUser(
      body.category_id,
      userId
    );


  if (!category) {

    const err =
      new Error(
        'Invalid category.'
      );

    err.status = 400;

    throw err;

  }


  let bankId = null;


  if (body.bank_id) {

   const bank =
  await repo.findBankByIdForUser(
    body.bank_id,
    userId
  );


    if (!bank) {

      const err =
        new Error(
          'Invalid bank/account.'
        );

      err.status = 400;

      throw err;

    }


    bankId =
      Number(body.bank_id);

  }


  return repo.updateEntry(
    entry,
    {

      /*
       * ALWAYS logged-in user
       */
      user_id: userId,

      category_id:
        Number(body.category_id),

      bank_id:
        bankId,

      type:
        Number(body.type),

      title:
        body.title.trim(),

      amount,

      note:
        body.note
          ? body.note.trim()
          : null,

      transaction_date:
        body.transaction_date,

    }
  );

}


/*
|--------------------------------------------------------------------------
| DELETE INCOME / EXPENSE
|--------------------------------------------------------------------------
*/

async function removeEntry(
  id,
  loggedInUserId
) {

  const entry =
    await repo.findEntryByIdForUser(
      id,
      loggedInUserId
    );


  if (!entry) {

    const err =
      new Error('Entry not found.');

    err.status = 404;

    throw err;

  }


  return repo.deleteEntry(id);

}


/*
|--------------------------------------------------------------------------
| ADD BANK
|--------------------------------------------------------------------------
*/

async function addBank(
  body,
  loggedInUserId
) {

  const userId =
    Number(loggedInUserId);


  if (!userId) {

    const err =
      new Error(
        'Authenticated user not found.'
      );

    err.status = 400;

    throw err;

  }


  if (!body.name) {

    const err =
      new Error(
        'Account name is required.'
      );

    err.status = 400;

    throw err;

  }


  const openingBalance =
    body.opening_balance
      ? parseFloat(body.opening_balance)
      : 0;


  if (
    !Number.isFinite(openingBalance) ||
    openingBalance < 0
  ) {

    const err =
      new Error(
        'Opening balance must be a valid amount.'
      );

    err.status = 400;

    throw err;

  }


  return repo.createBank({

    /*
     * NEVER trust body.user_id
     */
    user_id: userId,

    name:
      body.name.trim(),

    account_number:
      body.account_number
        ? body.account_number.trim()
        : null,

    opening_balance:
      openingBalance,

    is_active:
      body.is_active === undefined
        ? true
        : toBool(body.is_active),

  });

}


/*
|--------------------------------------------------------------------------
| UPDATE BANK
|--------------------------------------------------------------------------
*/

async function editBank(
  id,
  body,
  loggedInUserId
) {

  const userId =
    Number(loggedInUserId);


  const bank =
    await repo.findBankByIdForUser(
      id,
      userId
    );


  if (!bank) {

    const err =
      new Error('Account not found.');

    err.status = 404;

    throw err;

  }


  if (!body.name) {

    const err =
      new Error(
        'Account name is required.'
      );

    err.status = 400;

    throw err;

  }


  const openingBalance =
    body.opening_balance
      ? parseFloat(body.opening_balance)
      : 0;


  if (
    !Number.isFinite(openingBalance) ||
    openingBalance < 0
  ) {

    const err =
      new Error(
        'Opening balance must be a valid amount.'
      );

    err.status = 400;

    throw err;

  }


  return repo.updateBank(
    bank,
    {

      /*
       * Always current user.
       */
      user_id: userId,

      name:
        body.name.trim(),

      account_number:
        body.account_number
          ? body.account_number.trim()
          : null,

      opening_balance:
        openingBalance,

      is_active:
        body.is_active === undefined
          ? true
          : toBool(body.is_active),

    }
  );

}


/*
|--------------------------------------------------------------------------
| DELETE BANK
|--------------------------------------------------------------------------
*/

async function removeBank(
  id,
  loggedInUserId
) {

  const bank =
    await repo.findBankByIdForUser(
      id,
      loggedInUserId
    );


  if (!bank) {

    const err =
      new Error('Account not found.');

    err.status = 404;

    throw err;

  }


  return repo.deleteBank(id);

}


module.exports = {
  getList,
  addEntry,
  editEntry,
  removeEntry,
  addBank,
  editBank,
  removeBank,
};