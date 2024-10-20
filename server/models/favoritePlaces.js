// models/favoritePlaces.js

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
            unique: {
                msg: 'Location already exists'  
              },
            references: {
                model: 'Restaurants', // References the Restaurants model
                key: 'camis',
            },
        },
    });

    FavoritePlaces.associate = function(models) {
        FavoritePlaces.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
        FavoritePlaces.belongsTo(models.Restaurants, { foreignKey: 'camis', onDelete: 'CASCADE' }); // Link to Restaurants
    };

    return FavoritePlaces;
};

