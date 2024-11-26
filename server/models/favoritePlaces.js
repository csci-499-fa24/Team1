//models/favoritePlaces.js
 
module.exports = (sequelize, DataTypes) => {
    const FavoritePlaces = sequelize.define('FavoritePlaces', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'User', // References the User model
                key: 'id',
            },
        },
        camis: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Restaurants', // References the Restaurants model
                key: 'camis',
            },
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['userId', 'camis'], // Enforce unique combination
            },
        ],
    });

    FavoritePlaces.associate = function(models) {
        FavoritePlaces.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
        FavoritePlaces.belongsTo(models.Restaurants, { foreignKey: 'camis', onDelete: 'CASCADE' }); // Link to Restaurants
    };

    return FavoritePlaces;
};
