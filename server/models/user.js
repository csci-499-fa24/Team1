'use strict';
const { Model, Sequelize, DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const AppError = require('../utils/appError');


module.exports = (sequelize, DataTypes) => {

  const user = sequelize.define('user', {

      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER          //type: Sequelize.INTEGER
      },
      userType: {
        type: DataTypes.ENUM('0', '1'),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'userType cannot be null'
          },
          notEmpty: {
            msg: 'userType cannot be empty'
          }
        }
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'firstName cannot be null'
          },
          notEmpty: {
            msg: 'firstName cannot be empty'
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'email cannot be null'
          },
          notEmpty: {
            msg: 'email cannot be empty'
          },
          isEmail: {
            msg: 'Invalid email id'
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'password cannot be null'
          },
          notEmpty: {
            msg: 'passowrd cannot be empty'
          }
        }
      },
      confirmPassword: {
        type: DataTypes.VIRTUAL,    //not store in the database
        set(value) {
          if(this.password.length < 7) {
              throw new AppError('Password length must be greater than 7', 400)
          }
          if(value === this.password) {
              const hashPassword = bcrypt.hashSync(value, 10)  //encrypt password
              this.setDataValue('password', hashPassword);   //password is updated to hashpassword before store into db
          } else {
            throw new AppError (
              "Password and confirm password must be the same", 400
            );
          }
        }
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      deletedAt: {
        type: DataTypes.DATE
      },
    },{
    paranoid: true,     //use with deletedAt, enable sort, actual data will not be deleted, but mark as deleted
    freezeTableName: true,   //freeze table name
    modelName: 'user',

  });
  return user;
}
//module.exports = user;
