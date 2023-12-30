/* eslint-disable no-unused-vars */
const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../../infrastructures/middlewares/authenticate.middleware');
const DealServices = require('./deals.service');

const deal = new DealServices();

router.get('/', authenticateJWT, deal.getDeals);
router.get('/:id', authenticateJWT, deal.getDealById);
router.post('/', authenticateJWT, deal.saveDeal);
router.post('/search', authenticateJWT, deal.searchDeal);
router.post('/batch/update', authenticateJWT, deal.updateDeals);
router.post('/batch/delete', authenticateJWT, deal.deleteDeals);

module.exports = router;
