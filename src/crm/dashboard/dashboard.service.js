const {
  dealCollection,
  contactCollection,
  companiesCollection,
  productsCollection,
} = require('../../infrastructures/schemas');
const { getAggregateParams } = require('../../infrastructures/helpers/getAggregate');
const omit = require('lodash.omit');

module.exports = class dashboardService {
  async getDealsReport(req, res, next) {
    try {
      const aggregateParam = getAggregateParams();
      const dealReport = await dealCollection.aggregate(aggregateParam);
      return res.status(200).json({ data: { reports: omit(dealReport[0], '_id')?.reports ?? [] } });
    } catch (e) {
      next(e);
    }
  }

  async getContactsReport(req, res, next) {
    try {
      const aggregateParam = getAggregateParams();
      const contactReport = await contactCollection.aggregate(aggregateParam);
      return res.status(200).json({ data: { reports: omit(contactReport[0], '_id')?.reports ?? [] } });
    } catch (e) {
      next(e);
    }
  }

  async getOverAllReport(req, res) {
    const defaultReport = {
      totalContacts: 0,
      totalCompanies: 0,
      totalDeals: 0,
      totalProducts: 0,
    };
    try {
      defaultReport.totalContacts = await contactCollection.find().countDocuments();
      defaultReport.totalCompanies = await companiesCollection.find().countDocuments();
      defaultReport.totalDeals = await dealCollection.find().countDocuments();
      defaultReport.totalProducts = await productsCollection.find().countDocuments();

      res.status(200).json({
        dashboard: defaultReport,
      });
    } catch (e) {
      res.status(200).json({
        dashboard: defaultReport,
      });
    }
  }
};
