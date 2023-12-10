const {
  dealCollection,
  contactCollection,
  companiesCollection,
  productsCollection,
} = require('../infrastructures/schemas');
const logger = require('../infrastructures/utils/logger');
const omit = require('lodash.omit');

class DealServices {
  async getDeals(req, res) {
    logger.log('getDeals');
    const query = req?.query;
    const limit = query?.limit ? +query?.limit : 10;
    const skip = query?.skip ? +query?.skip : 0;
    const archived = query?.archived === 'true';
    const deals = await dealCollection.aggregate([
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
        pagination: deals[0]?.pagination?.length
          ? {
              ...deals[0]?.pagination[0],
            }
          : {
              total: 0,
              limit: limit,
              offset: skip,
            },
        data: deals[0]?.data ?? [],
      },
    });
  }

  async getDealById(req, res) {
    logger.log('getDealById');
    const data = req?.params;
    const deals = await dealCollection.findById({ _id: data?.id });
    return res.status(200).json({
      data: deals,
    });
  }

  async saveDeal(req, res) {
    logger.log('saveDeal');
    const dealData = req?.body;
    try {
      const deal = new dealCollection();
      deal.name = dealData?.name;   
      deal.price = dealData?.price;
      deal.quantity = dealData?.quantity ?? 1;
      if (dealData?.contactsId) {
        deal.contacts = await contactCollection.find({ _id: { $in: dealData.contactsId } });
      }
      if (dealData?.companiesId) {
        deal.companies = await companiesCollection.find({ _id: { $in: dealData.companiesId } });
      }
      if (dealData?.productsId) {
        deal.products = await productsCollection.find({ _id: { $in: dealData.productsId } });
      }
      deal.save();
      return res.status(200).json({
        data: deal,
      });
    } catch (e) {
      return res.status(400).json({
        error: e?.message,
      });
    }
  }

  async searchDeal(req, res) {
    logger.log('searchDeal');
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
      const deals = await dealCollection.aggregate(mongoQuery);
      return res.status(200).json({
        data: deals,
      });
    } catch (e) {
      return res.status(200).json({
        data: [],
      });
    }
  }

  async deleteDeals(req, res) {
    const data = req?.body;
    logger.log('deleteDealById');
    await dealCollection.updateMany(
      { _id: { $in: data?.deals?.map((deal) => deal.id) } },
      {
        $set: {
          is_deleted: true,
        },
      },
    );
    return res.status(204).json();
  }

  async updateDeals(req, res) {
    const dealUpdateData = req?.body;
    logger.log('updateDeals');
    const updatedDeals = [];
    for (const element of dealUpdateData.deals) {
      const deal = element;
      updatedDeals.push(
        await dealCollection.findOneAndUpdate(
          {
            _id: deal.id,
          },
          {
            $set: {
              ...omit(deal, ['id']),
            },
          },
          {
            returnDocument: 'after',
          },
        ),
      );
    }
    return res.status(200).json({
      data: updatedDeals,
    });
  }
}

module.exports = DealServices;
