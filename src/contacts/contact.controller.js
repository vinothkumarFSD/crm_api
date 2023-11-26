/* eslint-disable no-unused-vars */
const express = require('express');
const router = express.Router();

router.get('/contacts', async (req, res) => {
  res.send({ contacts: 'contacts' });
});
router.get('/contacts/:id', async (req, res) => {});
router.post('/contacts/', async (req, res) => {});
router.put('/contacts/:id', async (req, res) => {});
router.delete('/contacts/:id', async (req, res) => {});

module.exports = router;
