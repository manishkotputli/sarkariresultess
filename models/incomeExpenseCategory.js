'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

  class IncomeExpenseCategory extends Model {

    static associate(models) {

      IncomeExpenseCategory.belongsTo(
        models.User,
        {
          foreignKey: 'user_id',
        }
      );

      IncomeExpenseCategory.hasMany(
        models.IncomeExpense,
        {
          foreignKey: 'category_id',
        }
      );

    }

  }


  IncomeExpenseCategory.init({

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.TINYINT,
      allowNull: false,

      validate: {
        isIn: [[1, 2]],
      },
    },

  }, {

    sequelize,

    modelName: 'IncomeExpenseCategory',

    tableName: 'income_expense_categories',

    timestamps: false,

  });


  return IncomeExpenseCategory;

};