// models/user_plan.js
module.exports = (sequelize, DataTypes) => {
    const UserPlan = sequelize.define("UserPlan", {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'id',
            },
        },
        camis: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Restaurants',
                key: 'camis',
            },
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        date: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        eventName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        endTime: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        eventType: {
            type: DataTypes.ENUM('NYC Event', 'Self Event'),
            allowNull: false,
        },
    });

    UserPlan.associate = function(models) {
        UserPlan.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
        UserPlan.belongsTo(models.Restaurants, { foreignKey: 'camis', onDelete: 'CASCADE' });
    };

    return UserPlan;
};
