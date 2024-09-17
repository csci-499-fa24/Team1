// models/example.js
module.exports = (sequelize, DataTypes) => {
    const Example = sequelize.define("Example", {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    return Example;
};
