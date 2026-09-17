'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

  class IncomeExpense extends Model {

    static associate(models) {

      IncomeExpense.belongsTo(
        models.User,
        {
          foreignKey: 'user_id',
        }
      );

      IncomeExpense.belongsTo(
        models.IncomeExpenseCategory,
        {
          foreignKey: 'category_id',
        }
      );

      IncomeExpense.belongsTo(
        models.Bank,
        {
          foreignKey: 'bank_id',
        }
      );

    }

  }


  IncomeExpense.init({

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    bank_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    type: {
      type: DataTypes.INTEGER,
      allowNull: false,

      validate: {
        isIn: [[1, 2]],
      },
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,

      validate: {
        min: 0.01,
      },
    },

    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    transaction_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

  }, {

    sequelize,

    modelName: 'IncomeExpense',

    tableName: 'income_expenses',

    timestamps: false,

  });


  return IncomeExpense;

};