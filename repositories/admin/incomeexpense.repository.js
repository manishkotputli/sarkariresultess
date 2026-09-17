'use strict';

const db = require('../../models');

const { Op } = require('sequelize');


const PER_PAGE = 15;


/*
|--------------------------------------------------------------------------
| INCOME / EXPENSE LIST
|--------------------------------------------------------------------------
*/

async function list({
  search = '',
  type = '',
  userId,
  page = 1,
  perPage = PER_PAGE,
}) {

  const where = {

    /*
     * CURRENT USER ONLY
     */
    user_id: Number(userId),

  };


  if (type) {

    where.type =
      Number(type);

  }


  if (search) {

    where.title = {
      [Op.like]: `%${search}%`,
    };

  }


  const {
    rows,
    count,
  } =
    await db.IncomeExpense.findAndCountAll({

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

        {
          model: db.IncomeExpenseCategory,
          attributes: [
            'id',
            'name',
            'type',
          ],
        },

        {
          model: db.Bank,
          attributes: [
            'id',
            'name',
          ],
        },

      ],

      order: [
        ['transaction_date', 'DESC'],
        ['id', 'DESC'],
      ],

      limit:
        perPage,

      offset:
        (page - 1) * perPage,

    });


  return {
    entries: rows,
    total: count,
  };

}


/*
|--------------------------------------------------------------------------
| STATS
|--------------------------------------------------------------------------
*/

async function getStats(userId) {

  const whereUser = {
    user_id: Number(userId),
  };


  const income =
    await db.IncomeExpense.sum(
      'amount',
      {
        where: {
          ...whereUser,
          type: 1,
        },
      }
    );


  const expense =
    await db.IncomeExpense.sum(
      'amount',
      {
        where: {
          ...whereUser,
          type: 2,
        },
      }
    );


  const totalBanks =
    await db.Bank.count({
      where: {
        user_id: Number(userId),
        is_active: true,
      },
    });


  const totalEntries =
    await db.IncomeExpense.count({
      where: whereUser,
    });


  return {

    income:
      income || 0,

    expense:
      expense || 0,

    balance:
      (income || 0) -
      (expense || 0),

    totalBanks,

    totalEntries,

    totalUsers: 1,

  };

}


/*
|--------------------------------------------------------------------------
| BANK LIST
|--------------------------------------------------------------------------
*/

async function listBanks({
  userId,
  page = 1,
  perPage = 8,
} = {}) {

  const {
    rows,
    count,
  } =
    await db.Bank.findAndCountAll({

      where: {

        user_id:
          Number(userId),

        is_active:
          true,

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

      order: [
        ['id', 'DESC'],
      ],

      limit:
        perPage,

      offset:
        (page - 1) * perPage,

    });


  const banks =
    rows.map(function (bank) {

      return bank.get({
        plain: true,
      });

    });


  if (banks.length) {

    const bankIds =
      banks.map(
        bank => bank.id
      );


    const sums =
      await db.IncomeExpense.findAll({

        attributes: [

          'bank_id',

          'type',

          [
            db.sequelize.fn(
              'SUM',
              db.sequelize.col(
                'amount'
              )
            ),
            'total',
          ],

        ],

        where: {

          user_id:
            Number(userId),

          bank_id: {
            [Op.in]:
              bankIds,
          },

        },

        group: [
          'bank_id',
          'type',
        ],

        raw: true,

      });


    const agg = {};


    sums.forEach(function (row) {

      const bankId =
        row.bank_id;


      if (!agg[bankId]) {

        agg[bankId] = {
          income: 0,
          expense: 0,
        };

      }


      if (
        Number(row.type) === 1
      ) {

        agg[bankId].income =
          Number(row.total) || 0;

      } else {

        agg[bankId].expense =
          Number(row.total) || 0;

      }

    });


    banks.forEach(function (bank) {

      const data =
        agg[bank.id] || {
          income: 0,
          expense: 0,
        };


      bank.current_balance =
        Number(
          bank.opening_balance
        ) +
        data.income -
        data.expense;

    });

  }


  return {
    banks,
    total: count,
  };

}


/*
|--------------------------------------------------------------------------
| ENTRY
|--------------------------------------------------------------------------
*/

async function findEntryById(id) {

  return db.IncomeExpense.findByPk(id);

}


async function findEntryByIdForUser(
  id,
  userId
) {

  return db.IncomeExpense.findOne({

    where: {

      id:
        Number(id),

      user_id:
        Number(userId),

    },

  });

}


async function createEntry(data) {

  return db.IncomeExpense.create(
    data
  );

}


async function updateEntry(
  entry,
  data
) {

  return entry.update(data);

}


async function deleteEntry(id) {

  return db.IncomeExpense.destroy({

    where: {
      id: Number(id),
    },

  });

}


/*
|--------------------------------------------------------------------------
| BANK
|--------------------------------------------------------------------------
*/

async function findBankById(id) {

  return db.Bank.findByPk(id);

}


async function findBankByIdForUser(
  id,
  userId
) {

  return db.Bank.findOne({

    where: {

      id:
        Number(id),

      user_id:
        Number(userId),

    },

  });

}


async function createBank(data) {

  return db.Bank.create(data);

}


async function updateBank(
  bank,
  data
) {

  return bank.update(data);

}


async function deleteBank(id) {

  /*
   * Soft delete
   */
  return db.Bank.update(

    {
      is_active: false,
    },

    {
      where: {
        id: Number(id),
      },
    }

  );

}


/*
|--------------------------------------------------------------------------
| CATEGORY
|--------------------------------------------------------------------------
*/

async function findCategoryForUser(
  categoryId,
  userId
) {

  return db.IncomeExpenseCategory.findOne({

    where: {

      id:
        Number(categoryId),

      user_id:
        Number(userId),

    },

  });

}


/*
|--------------------------------------------------------------------------
| SELECT DATA
|--------------------------------------------------------------------------
*/

async function allBanksForSelect(
  userId
) {

  return db.Bank.findAll({

    where: {

      user_id:
        Number(userId),

      is_active:
        true,

    },

    attributes: [

      'id',
      'name',
      'user_id',
      'account_number',

    ],

    order: [
      ['name', 'ASC'],
    ],

  });

}


async function allCategoriesForSelect(
  userId
) {

  return db.IncomeExpenseCategory.findAll({

    where: {

      user_id:
        Number(userId),

    },

    attributes: [

      'id',
      'name',
      'user_id',
      'type',

    ],

    order: [
      ['name', 'ASC'],
    ],

  });

}


module.exports = {

  list,

  getStats,

  listBanks,

  findEntryById,
  findEntryByIdForUser,

  createEntry,
  updateEntry,
  deleteEntry,

  findBankById,
  findBankByIdForUser,

  createBank,
  updateBank,
  deleteBank,

  findCategoryForUser,

  allBanksForSelect,
  allCategoriesForSelect,

  PER_PAGE,

};