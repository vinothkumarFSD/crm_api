/* eslint-disable no-unused-vars */
const express = require('express');
const CompanyServices = require('./company.service');
const router = express.Router();
const { authenticateJWT } = require('../../infrastructures/middlewares/authenticate.middleware');

const companyService = new CompanyServices();

router.get('/', authenticateJWT, companyService.getCompanies);
router.get('/:id', authenticateJWT, companyService.getCompanyById);
router.post('/', authenticateJWT, companyService.saveCompany);
router.get('/search', authenticateJWT, companyService.searchCompany);
router.post('/batch/update', authenticateJWT, companyService.updateCompanies);
router.post('/batch/delete', authenticateJWT, companyService.deleteCompanies);

module.exports = router;
