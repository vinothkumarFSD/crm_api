const CustomError = require('../../infrastructures/errors/custom.error');
const { contactCollection, dealCollection } = require('../../infrastructures/schemas');
const logger = require('../../infrastructures/utils/logger');
const omit = require('lodash.omit');
const Common = require('../common/common');

const common = new Common();

// Contact Services
module.exports = class ContactServices {
  async getContacts(req, res, next) {
    logger.log('getContacts');
    try {
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
          data: contacts[0]?.data ?? [],
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async getContactByIds(contactIds) {
    logger.log('getContactByIds');
    const contacts = await contactCollection.find({
      _id: contactIds,
    });
    return contacts ?? [];
  }

  async getContactById(req, res, next) {
    logger.log('getContactById');
    try {
      const data = req?.params;
      // Valid the id.
      await common.isObjectId(data?.id);
      const contacts = await contactCollection.findById({ _id: data?.id });
      if (!contacts?._id) throw new CustomError('Contacts not found', 404);
      return res.status(200).json({
        data: contacts,
      });
    } catch (e) {
      next(e);
    }
  }

  async saveContact(req, res, next) {
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
      contact.postalCode = contactData.postalCode;
      contact.country = contactData.country;
      contact.created_date = new Date().toLocaleDateString();

      if (contactData?.dealsId) {
        contact.deals = await dealCollection.find({ _id: { $in: contactData.dealsId } });
      }

      const contactDocument = await contactCollection.findOneAndUpdate({ email: contactData?.email }, contact, {
        upsert: true,
        new: true,
      });

      return res.status(200).json({
        data: contactDocument,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateContacts(req, res, next) {
    const contactUpdateData = req?.body;
    logger.log('updateContacts');
    try {
      const updatedContacts = [];
      for (const element of contactUpdateData.contacts) {
        const contact = element;
        try {
          // Valid the id.
          await common.isObjectId(contact?.id);
        } catch (e) {
          updatedContacts.push({
            error: 'Invalid contact Id',
            id: contact?.id,
          });
          continue;
        }
        updatedContacts.push(
          await contactCollection.findOneAndUpdate(
            {
              _id: contact?.id,
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
    } catch (e) {
      next(e);
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

  async deleteContacts(req, res, next) {
    const data = req?.body;
    logger.log('deleteContactById');
    try {
      // Performing a soft delete on a table is essential as it allows us to maintain logs for audit purposes.
      await contactCollection.updateMany(
        { _id: { $in: data?.contacts?.map((contact) => contact.id) } },
        {
          $set: {
            is_deleted: true,
            deleted_at: new Date(),
          },
        },
      );
      return res.status(204).json();
    } catch (e) {
      next(e);
    }
  }
};
