// models/Locations.js
module.exports = (sequelize, DataTypes) => {
    const Locations = sequelize.define("Locations", {
        camis: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'Restaurants',
                key: 'camis',
            },
        },
        latitude: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        longitude: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        community_board: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        council_district: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        census_track: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        bin: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        bbl: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        nta: {
            type: DataTypes.STRING(4),
            allowNull: true,
        },
        location_point1: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
    });

    Locations.associate = (models) => {
        Locations.belongsTo(models.Restaurants, { foreignKey: 'camis' });
    };

    return Locations;
};
