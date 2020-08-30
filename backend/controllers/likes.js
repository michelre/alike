// Imports
var models = require('../models');
var jwtUtils = require('../utils/jwt.utils');
var asyncLib = require('async');

// Constants
const DISLIKED = 0;
const LIKED = 1;

// Routes
module.exports = {
    likePost: function (req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        // Params
        var messageId = parseInt(req.params.messageId);

        if (messageId <= 0) {
            return res.status(400).json({'error': 'invalid parameters'});
        }

        models.Message.findOne({
            where: {id: messageId},
            include: [{
                model: models.Like,
                where: {userId}
            }]
        }) // /!\ fausse instruction pour garder la structure '.then(...)' sans qu'il y ait d'erreur à cause de l'absence de la table Like --> a supprimer plus tard
            .then(foundLike => {
                return models.Message.findOne({
                    where: {id: messageId}
                }).then((message) => {
                    if (!foundLike) {
                        return message.addUser(userId)
                    } else {
                        return message.removeUser(userId)
                    }
                })
            })
            .then(() => {
                return models.Message.findOne({
                    where: {id: messageId},
                    include: [{
                        model: models.Like,
                    }]
                })
            })
            .then((post) => {
                res.status(201).json(post)
            })
            .catch(error => {
                console.log(error)
                res.status(400).json({error})
            });
    }
}

