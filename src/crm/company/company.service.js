const CustomError = require('../../infrastructures/errors/custom.error');
const { companiesCollection } = require('../../infrastructures/schemas');
const logger = require('../../infrastructures/utils/logger');
const omit = require('lodash.omit');
const Common = require('../common/common');

const common = new Common();
// Company Services
module.exports = class CompaniesService {
  async getCompanies(req, res, next) {
    logger.log('getCompanies');
    try {
      const query = req?.query;
      const limit = query?.limit ? +query?.limit : 10;
      const skip = query?.skip ? +query?.skip : 0;
      const archived = query?.archived === 'true';
      const companies = await companiesCollection.aggregate([
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
          pagination: companies[0]?.pagination?.length
            ? {
                ...companies[0]?.pagination[0],
              }
            : {
                total: 0,
                limit: limit,
                offset: skip,
              },
          data: companies[0]?.data ?? [],
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async getCompanyByIds(CompanyIds) {
    logger.log('getCompanyByIds');
    const companies = await companiesCollection.find({
      _id: CompanyIds,
    });
    return companies ?? [];
  }

  async getCompanyById(req, res, next) {
    logger.log('getCompanyById');
    try {
      const data = req?.params;
      // Valid the id.
      await common.isObjectId(data?.id);
      const companies = await companiesCollection.findById({ _id: data?.id });
      if (!companies?._id) throw new CustomError('companies not found', 404);
      return res.status(200).json({
        data: companies,
      });
    } catch (e) {
      next(e);
    }
  }

  async saveCompany(req, res, next) {
    logger.log('saveCompany');
    const companyData = req?.body;
    try {
      const isCompanyExists = await companiesCollection.findOne({
        email: companyData?.email,
        is_deleted: false,
      });

      const company = isCompanyExists || new companiesCollection();
      company.name = companyData.name;
      company.email = companyData.email;
      company.address = companyData.address;
      company.domain = companyData.domain;
      company.mobilephone = companyData.mobilephone;
      company.state = companyData.state;
      company.city = companyData.city;
      company.country = companyData.country;
      company.created_date = new Date().toLocaleDateString();

      const companyDocument = await companiesCollection.findOneAndUpdate({ email: companyData?.email }, company, {
        upsert: true,
        new: true,
      });

      return res.status(200).json({
        data: companyDocument,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateCompanies(req, res, next) {
    const companyUpdateData = req?.body;
    logger.log('updateCompanies');
    try {
      const updatedCompanies = [];
      for (const element of companyUpdateData?.companies ?? []) {
        const company = element;
        try {
          // Valid the id.
          await common.isObjectId(company.id);
        } catch (e) {
          updatedCompanies.push({
            error: 'Invalid company Id',
            id: company.id,
          });
          continue;
        }
        updatedCompanies.push(
          await companiesCollection.findOneAndUpdate(
            {
              _id: company.id,
            },
            {
              $set: {
                ...omit(company, ['id']),
              },
            },
            {
              returnDocument: 'after',
            },
          ),
        );
      }
      return res.status(200).json({
        data: updatedCompanies,
      });
    } catch (e) {
      next(e);
    }
  }

  async searchCompany(req, res) {
    logger.log('searchCompany');
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

    if (query?.domain) {
      matchQuery.unshift({
        domain: { $regex: query.firstname, $options: 'i' },
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
      const companies = await companiesCollection.aggregate(mongoQuery);
      return res.status(200).json({
        data: companies,
      });
    } catch (e) {
      return res.status(200).json({
        data: [],
      });
    }
  }

  async deleteCompanies(req, res, next) {
    const data = req?.body;
    logger.log('deleteCompanies');
    try {
      // Performing a soft delete on a table is essential as it allows us to maintain logs for audit purposes.
      await companiesCollection.updateMany(
        { _id: { $in: data?.companies?.map((Company) => Company.id) } },
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
