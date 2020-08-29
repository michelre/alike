// Imports
const express = require('express');

const multer = require('../middleware/multer-config');

const messagesCtrl = require('../controllers/messages');

// Router
exports.router = (function () {
    const messagesRouter = express.Router();

    // Messages routes
    messagesRouter.post('/messages/new/', multer, messagesCtrl.createMessage);
    messagesRouter.get('/messages/', messagesCtrl.listMessages);
    messagesRouter.get('/messages/:id',  messagesCtrl.getOneMessage);
    messagesRouter.put('/messages/:id', multer, messagesCtrl.updatePost);
    messagesRouter.delete('/messages/delete/:id', messagesCtrl.deletePost);



    return messagesRouter;
})();