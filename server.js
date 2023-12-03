const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const api = '/api/v1';

// eslint-disable-next-line no-undef
mongoose.connect(process.env.MONGO_URI);

const { morganMiddleware } = require('./src/infrastructures/middlewares/morgan.middleware');
const logger = require('./src/infrastructures/utils/logger');


// Controllers
const authController = require('./src/auth/auth.controller');
const contactController = require('./src/contacts/contacts.controller');
const ErrorHandler = require('./src/infrastructures/middlewares/errorHandler');

// eslint-disable-next-line no-undef
const PORT = 3000;

app.options('*', (req, res) => res.send(200));


app.use(bodyParser.json());
app.use(cors());
app.use(morganMiddleware);

app.use(`${api}/auth`, authController);
app.use(`${api}/contacts`, contactController);

app.use(ErrorHandler);

app.listen(PORT, () => {
  logger.log(`Server is listening on port ${PORT}`);
});
