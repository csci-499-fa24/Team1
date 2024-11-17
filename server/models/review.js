module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define("Review", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        camis: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    });

    Review.associate = (models) => {
        Review.belongsTo(models.Restaurants, { foreignKey: 'camis', as: 'restaurant' });
        Review.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return Review;
};

