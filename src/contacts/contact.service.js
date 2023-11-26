const { contactCollection } = require('../infrastructures/database/schemas');
const logger = require('../infrastructures/utils/logger');

class ContactServices {
  async getContacts() {
    logger.log('getContacts');
    return await contactCollection.find()
  }
}

module.exports = ContactServices;
