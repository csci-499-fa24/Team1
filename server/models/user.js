'use strict';
const { Model, DataTypes } = require('sequelize');
const AppError = require('../utils/appError');

module.exports = (sequelize) => {
  class User extends Model {}

  User.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    userType: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
      validate: {
        notNull: { msg: 'userType cannot be null' },
        notEmpty: { msg: 'userType cannot be empty' },
      },
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'userName cannot be null' },
        notEmpty: { msg: 'userName cannot be empty' },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email address already exists', // Custom error message for duplicate email
      },
      validate: {
        notNull: { msg: 'email cannot be null' },
        notEmpty: { msg: 'email cannot be empty' },
        isEmail: { msg: 'Invalid email id' },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'password cannot be null' },
        notEmpty: { msg: 'password cannot be empty' },
        len: {
          args: [8, 128],
          msg: 'Password must be at least 8 characters long',
        },
      },
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: 'User',
    paranoid: true,
    freezeTableName: true,
  });

  // Define associations
  User.associate = function (models) {
    User.hasMany(models.FavoritePlaces, {
      foreignKey: 'userId',
      as: 'favoriteLocations',
    });
  };

  return User;
};