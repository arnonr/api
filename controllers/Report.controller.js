const Service = require("../services/Report.service"),
  jwt = require("jsonwebtoken");

const methods = {
  async onGetAll(req, res) {
    try {
      let result = await Service.find(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetReport1(req, res) {
    try {
      let result = await Service.report1(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetReport2(req, res) {
    try {
      let result = await Service.report2(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetReport3(req, res) {
    try {
      let result = await Service.report3(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetReport4(req, res) {
    try {
      let result = await Service.report4(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
};

module.exports = { ...methods };
