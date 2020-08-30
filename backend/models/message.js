'use strict';
module.exports = (sequelize, DataTypes) => {
    var Message = sequelize.define('Message', {
        title: DataTypes.STRING,
        content: DataTypes.STRING,
        attachement: DataTypes.STRING,
        likes: DataTypes.INTEGER,
    }, {});

    Message.associate = function(models) {
        models.Message.belongsTo(models.User, {foreignKey: 'userId'});
        models.Message.hasMany(models.Like);
    };

    return Message;
};
