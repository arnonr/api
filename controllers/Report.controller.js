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

  async onGetReport5(req, res) {
    try {
      let result = await Service.report5(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetReport6(req, res) {
    try {
      let result = await Service.report6(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetReport7(req, res) {
    try {
      let result = await Service.report7(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetReport8(req, res) {
    try {
      let result = await Service.report8(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetReport10(req, res) {
    try {
      let result = await Service.report10(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetReport11(req, res) {
    try {
      let result = await Service.report11(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetReport12(req, res) {
    try {
      let result = await Service.report12(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetReport99(req, res) {
    try {
      let result = await Service.report99(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
};

module.exports = { ...methods };
