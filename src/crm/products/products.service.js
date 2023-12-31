const { productsCollection } = require('../../infrastructures/schemas');
const logger = require('../../infrastructures/utils/logger');
const CustomError = require('../../infrastructures/errors/custom.error');
const omit = require('lodash.omit');
const Common = require('../common/common');

const common = new Common();

module.exports = class ProductServices {
  async getProducts(req, res, next) {
    logger.log('getProducts');
    try {
      const query = req?.query;
      const limit = query?.limit ? +query?.limit : 10;
      const skip = query?.skip ? +query?.skip : 0;
      const archived = query?.archived === 'true';
      const products = await productsCollection.aggregate([
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
          pagination: products[0]?.pagination?.length
            ? {
                ...products[0]?.pagination[0],
              }
            : {
                total: 0,
                limit: limit,
                offset: skip,
              },
          data: products[0]?.data ?? [],
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async getProductById(req, res, next) {
    logger.log('getProductById');
    try {
      const data = req?.params;
      // Valid the id.
      await common.isObjectId(data?.id);
      const product = await productsCollection.findById({ _id: data?.id });
      if (!product?._id) throw new CustomError('Product not found', 404);
      return res.status(200).json({
        data: product,
      });
    } catch (e) {
      next(e);
    }
  }

  async saveProduct(req, res, next) {
    logger.log('saveProduct');
    const productData = req?.body;
    try {
      const product = new productsCollection();
      product.name = productData?.name;
      product.price = productData?.price;
      product.created_date = new Date().toLocaleDateString();
      product.save();

      return res.status(200).json({
        data: product,
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
      const deals = await productsCollection.aggregate(mongoQuery);
      return res.status(200).json({
        data: deals,
      });
    } catch (e) {
      return res.status(200).json({
        data: [],
      });
    }
  }

  async deleteProducts(req, res) {
    logger.log('deleteProducts');
    const data = req?.body;
    await productsCollection.updateMany(
      { _id: { $in: data?.products?.map((product) => product.id) } },
      {
        $set: {
          is_deleted: true,
          deleted_at: new Date(),
        },
      },
    );
    return res.status(204).json();
  }

  async updateProducts(req, res) {
    logger.log('updateProducts');
    const productUpdateData = req?.body;
    const updatedProducts = [];
    for (const element of productUpdateData?.products ?? []) {
      const product = element;
      try {
        // Valid the id.
        await common.isObjectId(product?.id);
      } catch (e) {
        updatedProducts.push({
          error: 'Invalid product Id',
          id: product?.id,
        });
        continue;
      }
      updatedProducts.push(
        await productsCollection.findOneAndUpdate(
          {
            _id: product?.id,
          },
          {
            $set: {
              ...omit(product, ['id']),
            },
          },
          {
            returnDocument: 'after',
          },
        ),
      );
    }
    return res.status(200).json({
      data: updatedProducts,
    });
  }
};
