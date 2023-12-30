/* eslint-disable no-unused-vars */
const express = require('express');
const ContactServices = require('./contacts.service');
const router = express.Router();
const { authenticateJWT } = require('../../infrastructures/middlewares/authenticate.middleware');

const contact = new ContactServices();

router.get('/', authenticateJWT, contact.getContacts);
router.get('/:id', authenticateJWT, contact.getContactById);
router.post('/', authenticateJWT, contact.saveContact);
router.get('/search', authenticateJWT, contact.searchContact);
router.post('/batch/update', authenticateJWT, contact.updateContacts);
router.post('/batch/delete', authenticateJWT, contact.deleteContacts);

module.exports = router;
