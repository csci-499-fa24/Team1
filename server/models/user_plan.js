// models/user_plan.js
module.exports = (sequelize, DataTypes) => {
    const UserPlan = sequelize.define("UserPlan", {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
        },
        camis: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Restaurants',
                key: 'camis',
            },
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        date: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    UserPlan.associate = function(models) {
        UserPlan.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
        UserPlan.belongsTo(models.Restaurants, { foreignKey: 'camis', onDelete: 'CASCADE' });
    };

    return UserPlan;
};
