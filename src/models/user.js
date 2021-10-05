module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("user", {
        name: {
            type: sequelize.STRING,
            allowNull: false
        },
        age: {
            type: sequelize.INTEGER,
            allowNull: false
        },
        password: {
            type: sequelize.STRING,
            allowNull: true
        }
    });
    return User;
};