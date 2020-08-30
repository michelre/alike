// Imports
const models = require('../models');
const asyncLib = require('async');
const jwtUtils = require('../utils/jwt.utils');
const fs = require('fs').promises

// Routes
module.exports = {
    createMessage: function (req, res) {
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth);

        const title = req.body.title;
        const content = req.body.content;

        // si le champ title ou le champ content sont vide = erreur !
        if (title == null || content == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
        }

        createMessage: function (req, res) {
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth);

        const title = req.body.title;
        const content = req.body.content;

        // si le champ title ou le champ content sont vide = erreur !
        if (title == null || content == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
        }

        models.User.findOne({
            attributes: ['email'],
            where: {email: email}
        })
            .then(function (userFound) {
                if (!userFound) {
                    return res.status(400).json({'error': 'user not found'});
                }
                models.Message.create({
                    title: title,
                    content: content,
                    likes: 0,
                    UserId: userFound.id,
                    attachment: req.file ? req.file.filename : null
                })
               .then((newMessage) => {
                        return res.status(201).json(newMessage);
                    }).catch(() => {
                        return res.status(500).json({'error': 'cannot post message'});
                    })

            })
            .catch(function (err) {
                return res.status(500).json({'error': 'unable to verify user'});
            });
    },

    listMessages: function (req, res) {
        const userId = jwtUtils.getUserId(req.headers['authorization']);
        const fields = req.query.fields; // permet de selectionner les colonnes qu'on veut afficher
        const limit = parseInt(req.query.limit); // pour visualiser juste un nombre de messages
        const offset = parseInt(req.query.offset);
        const order = req.query.order; // pour mettre les messages dans un ordre particulier

        /**
         * Récupération de l'utilisateur connecté afin de savoir si il est administrateur
         */
        models.User.findByPk(userId, {attributes: ['id']}).then((user) => {
            return models.Message.findAll({
                order: [(order != null) ? order.split(':') : ['createdAt', 'ASC']],
                attributes: ['id'],
                include: [
                    {
                        model: models.User,
                        as: 'User',
                        attributes: ['firstName', 'lastName'],
                    },
                    {
                        model: models.Like,
                        as: 'Likes'
                    }
                ]
            }).then((messages) => ({messages, isAdmin: user.get('isAdmin')}))
        }).then(function ({messages, isAdmin}) {
            res.status(200).json(messages)
            /*if (messages) {
                const jsonMessages = []
                for (let i = 0; i < messages.length; i++) {
                    const jsonMessage = messages[i].toJSON();
                    //Si le message concerne l'utilisateur connecté, on ajoute un champ modifiable
                    jsonMessage['modifiable'] = userId === jsonMessage.UserId || isAdmin
                    jsonMessage['liked'] = jsonMessage.Likes.find((like) => {
                        return like.UserId === userId && like.isLike > 0
                    })
                    jsonMessages.push(jsonMessage)
                }
                res.status(200).json(jsonMessages);
            } else {
                res.status(404).json({ "error": "no messages found" });
            }*/
        }).catch(function (err) {
            console.log(err);
            res.status(500).json({ 'error': 'invalid fields' });
        })
    },

    getOneMessage: function (req, res) {
        models.Message.findByPrimary(req.params.id).then(function (message) {
            if (message) {
                res.status(200).json(message);
            } else {
                res.status(404).json({ "error": "no message found" });
            }
        }).catch(function (err) {
            console.log(err);
            res.status(500).json({ 'error': 'invalid fields ' });
        })
    },

    // Modifier un post
    updatePost: function (req, res) {
        const id = req.params.id
        const title = req.body.title
        const content = req.body.content
        models.Message.findByPrimary(req.params.id).then(function (message) {
            if (message) {
                message.update({
                    title,
                    content,
                }).then(() => {
                    res.status(200).json(message);
                }).catch(() => {
                    res.status(500).json({ 'error': 'invalid fields' });
                })

            } else {
                res.status(404).json({ 'error': "no message found" });
            }
        }).catch(function (err) {
            console.log(err);
            res.status(500).json({ 'error': 'invalid fields' });
        })
    },

    // Effacer un post
    deletePost: function (req, res) {
        const id = req.params.id

        models.Message.findByPrimary(id).then((message) => {
            const attachment = message.get('attachment');
            let response = null
            if(!attachment){
                response = message.destroy()
            } else {
                const filePath = __dirname + '/../medias' + attachment
                response = fs.unlink(filePath)
                    .then(() => message.destroy())
            }
            response.then(() => res.status(204).json())
                .catch((error) => res.status(400).json({ error }))
        })
    }
}


