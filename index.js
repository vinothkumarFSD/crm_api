const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Path API version
const api = '/api/v1';

// Path CRM Modules
const crm = 'crm';

// eslint-disable-next-line no-undef
mongoose.connect(process.env.MONGO_URI);

const { morganMiddleware } = require('./src/infrastructures/middlewares/morgan.middleware');
const logger = require('./src/infrastructures/utils/logger');

// Controllers
const authController = require('./src/auth/auth.controller');
const contactController = require('./src/crm/contacts/contacts.controller');
const dealController = require('./src/crm/deals/deals.controller');
const productController = require('./src/crm/products/products.controller');
const companyController = require('./src/crm/company/company.controller');
const dashboardController = require('./src/crm/dashboard/dashboard.controller');
const ErrorHandler = require('./src/infrastructures/middlewares/errorHandler');
const headers = require('./src/infrastructures/middlewares/headers');

// eslint-disable-next-line no-undef
const PORT = 3000;

app.use(bodyParser.json());
app.use(headers)
app.use(
  cors({
    origin: '*',
    optionsSuccessStatus: 200
  }),
);
app.use(morganMiddleware);

app.get('/', (req, res) => {
  res.json('Success');
});

app.use(`${api}/auth`, authController);
app.use(`${api}/${crm}/contacts`, contactController);
app.use(`${api}/${crm}/deals`, dealController);
app.use(`${api}/${crm}/products`, productController);
app.use(`${api}/${crm}/companies`, companyController);
app.use(`${api}/${crm}/dashboard`, dashboardController);

app.use(ErrorHandler);

app.listen(PORT, () => {
  logger.log(`Server is listening on port ${PORT}`);
});
