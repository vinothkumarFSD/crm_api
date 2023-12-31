const CustomError = require('../../infrastructures/errors/custom.error');
const {
  dealCollection,
  companiesCollection,
  productsCollection,
  contactCollection,
} = require('../../infrastructures/schemas');
const logger = require('../../infrastructures/utils/logger');
const omit = require('lodash.omit');
const Common = require('../common/common');

const common = new Common();

class DealServices {
  async getDeals(req, res, next) {
    logger.log('getDeals');
    try {
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
    } catch (e) {
      next(e);
    }
  }

  async getDealById(req, res, next) {
    logger.log('getDealById');
    try {
      const data = req?.params;
      // Valid the id.
      await common.isObjectId(data?.id);
      const deal = await dealCollection.findById({ _id: data?.id });
      if (!deal?._id) throw new CustomError('Deal not found', 404);
      return res.status(200).json({
        data: deal,
      });
    } catch (e) {
      next(e);
    }
  }

  async saveDeal(req, res, next) {
    logger.log('saveDeal');
    const dealData = req?.body;
    try {
      const deal = new dealCollection();
      deal.name = dealData?.name;
      deal.price = dealData?.price;
      deal.quantity = dealData?.quantity ?? 1;
      deal.created_date = new Date().toLocaleDateString();
      
      if (dealData?.contactsId) {
        deal.contacts = await contactCollection.find({ _id: dealData?.contactsId });
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
      next(e);
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

    if (query?.price) {
      matchQuery.unshift({
        price: { $eq: query.price },
      });
    }

    if (query?.name) {
      matchQuery.unshift({
        name: { $regex: query.name, $options: 'i' },
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
          deleted_at: new Date(),
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
      try {
        // Valid the id.
        await common.isObjectId(deal?.id);
      } catch (e) {
        updatedDeals.push({
          error: 'Invalid deal Id',
          id: deal?.id,
        });
        continue;
      }
      updatedDeals.push(
        await dealCollection.findOneAndUpdate(
          {
            _id: deal?.id,
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
