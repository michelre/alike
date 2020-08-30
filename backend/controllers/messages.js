// Imports
const models = require('../models');
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

        models.User.findByPk(userId)
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
                include: [
                    {
                        model: models.User,
                        as: 'User',
                        attributes: ['id', 'firstName', 'lastName', 'isAdmin'],
                    },
                    {
                        model: models.Like,
                        as: 'Likes'
                    }
                ]
            }).then((messages) => ({messages: messages, isAdmin: user.get('isAdmin')}))
        }).then(function ({messages, isAdmin}) {
            //On ajoute un attribut modifiable si le message appartient à l'utilisateur ou à l'admin
            const m = messages
                .map(m => ({...m.dataValues, modifiable: isAdmin || m.dataValues.User.id === userId}))
            res.status(200).json(m)
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

        models.Message.findByPk(id).then((message) => {
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


