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
};

module.exports = { ...methods };
