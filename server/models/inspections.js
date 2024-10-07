// models/Inspections.js
module.exports = (sequelize, DataTypes) => {
    const Inspections = sequelize.define("Inspections", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        camis: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Restaurants',
                key: 'camis',
            },
        },
        inspection_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        action: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        violation_code: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        violation_description: {
            type: DataTypes.STRING(300),
            allowNull: true,
        },
        critical_flag: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        grade: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        grade_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        inspection_type: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    });

    Inspections.associate = (models) => {
        Inspections.belongsTo(models.Restaurants, { foreignKey: 'camis' });
    };

    return Inspections;
};
