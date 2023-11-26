const contactCollection = require('./schemas');

const mongoose = require('mongoose');

class MongooseClient {
  constructor(client) {
    if (client) {
      // eslint-disable-next-line no-undef
      this.client = new mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  }

  static async findContacts() {
    return await contactCollection.find();
  }

  static async findContactById(id) {
    return await contactCollection.findById(id);
  }

  static async saveContact(contactData) {
    const contact = new contactCollection();
    contact.save(contactData);
  }

  static async searchContact() {
    return await contactCollection.find({});
  }
}

module.exports = MongooseClient;
