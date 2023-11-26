const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const { morganMiddleware } = require('./src/infratructures/middlewares/morgan.middleware');
const { logger } = require('./src/infratructures/utils/logger');

// Controllers
const contactController = require('./src/contacts/contact.controller');

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morganMiddleware);
app.use(bodyParser.json());

app.use('/api/v1', contactController);

app.listen(PORT, () => {
  logger.log(`Server is listening on port ${PORT}`);
});
