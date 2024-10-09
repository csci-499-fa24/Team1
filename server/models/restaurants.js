// models/Restaurants.js
module.exports = (sequelize, DataTypes) => {
    const Restaurants = sequelize.define("Restaurants", {
        camis: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        dba: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        boro: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        building: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        street: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        zipcode: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        phone: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        cuisine_description: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    });

    Restaurants.associate = (models) => {
        Restaurants.hasMany(models.Inspections, { foreignKey: 'camis' });
        Restaurants.hasOne(models.Locations, { foreignKey: 'camis' });
    };

    return Restaurants;
};
