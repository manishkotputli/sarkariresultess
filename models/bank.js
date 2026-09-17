'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

  class Bank extends Model {

    static associate(models) {

      Bank.belongsTo(
        models.User,
        {
          foreignKey: 'user_id',
        }
      );

      Bank.hasMany(
        models.IncomeExpense,
        {
          foreignKey: 'bank_id',
        }
      );

    }

  }


  Bank.init({

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    account_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    opening_balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

  }, {

    sequelize,

    modelName: 'Bank',

    tableName: 'banks',

    timestamps: false,

  });


  return Bank;

};