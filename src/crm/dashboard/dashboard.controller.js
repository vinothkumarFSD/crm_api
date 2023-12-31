/* eslint-disable no-unused-vars */
const express = require('express');
const DashBoardService = require('./dashboard.service');
const router = express.Router();
const { authenticateJWT } = require('../../infrastructures/middlewares/authenticate.middleware');

const dashboard = new DashBoardService();

const report = 'reports';

router.get(`/${report}/deal`, authenticateJWT, dashboard.getDealsReport);
router.get(`/${report}/contact`, authenticateJWT, dashboard.getContactsReport);
router.get(`/${report}`, authenticateJWT, dashboard.getOverAllReport);

module.exports = router;
