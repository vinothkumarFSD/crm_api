const { contactCollection, dealCollection } = require('../infrastructures/schemas');
const logger = require('../infrastructures/utils/logger');
const omit = require('lodash.omit');

class ContactServices {
  async getContacts(req, res) {
    logger.log('getContacts');
    const query = req?.query;
    const limit = query?.limit ? +query?.limit : 10;
    const skip = query?.skip ? +query?.skip : 0;
    const archived = query?.archived === 'true';
    const contacts = await contactCollection.aggregate([
      {
        $match: {
          is_deleted: archived,
        },
      },
      {
        $sort: {
          created_at: -1,
        },
      },
      {
        $facet: {
          pagination: [{ $count: 'total' }, { $addFields: { limit: limit, offset: skip } }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);
    return res.status(200).json({
      data: {
        pagination: contacts[0]?.pagination?.length
          ? {
              ...contacts[0]?.pagination[0],
            }
          : {
              total: 0,
              limit: limit,
              offset: skip,
            },
        contacts: contacts[0]?.data ?? [],
      },
    });
  }

  async getContactById(req, res) {
    logger.log('getContactById');
    const data = req?.params;
    const contacts = await contactCollection.findById({ _id: data?.id });
    return res.status(200).json({
      data: contacts,
    });
  }

  async saveContact(req, res) {
    logger.log('saveContact');
    const contactData = req?.body;
    try {
      const isContactExists = await contactCollection.findOne({
        email: contactData?.email,
        is_deleted: false,
      });
      const contact = isContactExists || new contactCollection();
      contact.email = contactData.email;
      contact.firstname = contactData.firstname;
      contact.lastname = contactData.lastname;
      contact.whatsapp = contactData.whatsapp;
      contact.mobilephone = contactData.mobilephone;
      contact.address = contactData.address;
      contact.state = contactData.state;
      contact.city = contactData.city;
      contact.country = contactData.country;
      if (contactData?.dealId) {
        contact.deal = await dealCollection.findById({
          id: contactData?.dealId,
        });
      }
      const contactDocument = await contactCollection.findOneAndUpdate({ email: contactData?.email }, contact, {
        upsert: true,
        new: true,
      });
      return res.status(200).json({
        data: contactDocument,
      });
    } catch (e) {
      return res.status(400).json({
        error: e?.message,
      });
    }
  }

  async searchContact(req, res) {
    logger.log('searchContact');
    const query = req?.body;
    const limit = query?.limit ?? 10;
    const skip = query?.skip ?? 0;
    const matchQuery = [
      {
        $sort: { created_at: -1 },
      },
    ];

    if (query?.email) {
      matchQuery.unshift({
        email: { $regex: query.email, $options: 'i' },
      });
    }

    if (query?.firstname) {
      matchQuery.unshift({
        firstname: { $regex: query.firstname, $options: 'i' },
      });
    }

    try {
      const mongoQuery = [];
      if (matchQuery?.length) {
        mongoQuery.push({
          $match: {
            $and: matchQuery,
          },
        });
      }
      mongoQuery.push({
        $facet: {
          pagination: [{ $count: 'total' }, { $addFields: { limit: limit, offset: skip } }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      });
      const contacts = await contactCollection.aggregate(mongoQuery);
      return res.status(200).json({
        data: contacts,
      });
    } catch (e) {
      return res.status(200).json({
        data: [],
      });
    }
  }

  async deleteContacts(req, res) {
    const data = req?.body;
    logger.log('deleteContactById');
    await contactCollection.updateMany(
      { _id: { $in: data?.contacts?.map((contact) => contact.id) } },
      {
        $set: {
          is_deleted: true,
        },
      },
    );
    return res.status(204).json();
  }

  async updateContacts(req, res) {
    const contactUpdateData = req?.body;
    logger.log('updateContacts');
    const updatedContacts = [];
    for (const element of contactUpdateData.contacts) {
      const contact = element;
      updatedContacts.push(
        await contactCollection.findOneAndUpdate(
          {
            _id: contact.id,
          },
          {
            $set: {
              ...omit(contact, ['id']),
            },
          },
          {
            returnDocument: 'after',
          },
        ),
      );
    }
    return res.status(200).json({
      data: updatedContacts,
    });
  }
}

module.exports = ContactServices;
