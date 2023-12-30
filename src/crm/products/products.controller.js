/* eslint-disable no-unused-vars */
const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../../infrastructures/middlewares/authenticate.middleware');
const ProductServices = require('./products.service');

const productServices = new ProductServices();

router.get('/', authenticateJWT, productServices.getProducts);
router.get('/:id', authenticateJWT, productServices.getProductById);
router.post('/', authenticateJWT, productServices.saveProduct);
router.post('/search', authenticateJWT, productServices.searchDeal);
router.post('/batch/update', authenticateJWT, productServices.updateProducts);
router.post('/batch/delete', authenticateJWT, productServices.deleteProducts);

module.exports = router;
