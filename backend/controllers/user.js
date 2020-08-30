// Imports
const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/jwt.utils');
const models = require('../models');
const asyncLib = require('async');


// Constants
const EMAIL_REGEX     = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX  = /^(?=.*\d).{4,8}$/;

// Routes
module.exports = {
    register: function (req, res) {
        // Params
        const email = req.body.email;
        const password = req.body.password;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const bio      = req.body.bio;

        if (email == null || password == null || firstName == null || lastName == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
        }

        if (username.length >= 13 || username.length <= 4) {
          return res.status(400).json({ 'error': 'wrong username (must be length 5 - 12)' });
        }
    
        if (!EMAIL_REGEX.test(email)) {
          return res.status(400).json({ 'error': 'email is not valid' });
        }
    
        if (!PASSWORD_REGEX.test(password)) {
          return res.status(400).json({ 'error': 'password invalid (must length 4 - 8 and include 1 number at least)' });
        }
    
        asyncLib.waterfall([
          function(done) {
            models.User.findOne({
              attributes: ['email'],
              where: { email: email }
            })
            .then(function(userFound) {
              done(null, userFound);
            })
            .catch(function(err) {
              return res.status(500).json({ 'error': 'unable to verify user' });
            });
          },
          function(userFound, done) {
            if (!userFound) {
              bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
                done(null, userFound, bcryptedPassword);
              });
            } else {
              return res.status(409).json({ 'error': 'user already exist' });
            }
          },
          function(userFound, bcryptedPassword, done) {
            var newUser = models.User.create({
              email: email,
              username: username,
              password: bcryptedPassword,
              bio: bio,
              isAdmin: 0
            })
            .then(function(newUser) {
              done(newUser);
            })
            .catch(function(err) {
              return res.status(500).json({ 'error': 'cannot add user' });
            });
          }
        ], function(newUser) {
          if (newUser) {
            return res.status(201).json({
              'userId': newUser.id
            });
          } else {
            return res.status(500).json({ 'error': 'cannot add user' });
          }
        });
      },
    login: function (req, res) {
        const email = req.body.email;
        const password = req.body.password;

        if (email == null || password == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
        }

        models.User.findOne({
            where: { email: email }
        })
            .then(function (userFound) {
                if (userFound) {
                    bcrypt.compare(password, userFound.password, function (errBycrypt, resBycrypt) {
                        if (resBycrypt) {
                            return res.status(200).json({
                                "status": "OK",
                                'userId': userFound.id,
                                'token': jwtUtils.generateTokenForUser(userFound)
                            });
                        } else {
                            return res.status(403).json({ 'error': 'invalid password' });
                        }
                    });
                } else {
                    return res.status(404).json({ 'error': 'user not exist in DB' });
                }
            })
            .catch(function (err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
            });

    },

    // Pour recuperer le profile et pouvoir le modifier
    getUserProfile: function (req, res) {
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth);

        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });

        models.User.findOne({
            attributes: ['id', 'email', 'firstName', 'lastName', 'bio'],
            where: { id: userId }
        }).then(function (user) {
            if (user) {
                res.status(201).json(user);
            } else {
                res.status(404).json({ 'error': 'user not found' });
            }
        }).catch(function (err) {
            res.status(500).json({ 'error': 'cannot fetch user' });
        })
    },

    // Pour modifier le profile
    updateUserProfile: function (req, res) {
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth);
        //params
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const email = req.body.email;


        models.User.findOne({
            attributes: ['firstname'],
            where: {firstname: firstName}
        })).then(function (user) {
            if (user) {
                user.update({
                    firstName,
                    lastName,
                    email
                }).then(() => {
                    res.status(200).json(user);
                }).catch(() => {
                    res.status(500).json({'error': 'invalid fields '});
                })

            } else {
                res.status(404).json({"error": "no user found"});
            }
        }).catch(function (err) {
            console.log(err);
            res.status(500).json({'error': 'invalid fields '});
        })
    },
    //
    deleteUserProfil: (req, res) => {
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth);

        models.Like
            .destroy({ where: { UserId: userId } })
            .then(() => models.Message.destroy({ where: { userId: userId } }))
            .then(() => models.User.destroy({where: {id: userId}}))
            .then(() => res.status(204).json())
            .catch(error => res.status(400).json({ error }));
    }

    //
}
