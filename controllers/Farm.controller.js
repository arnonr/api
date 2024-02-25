const Service = require("../services/Farm.service"),
  jwt = require("jsonwebtoken");

const methods = {
  async onGetExportExcel(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      req.body.UserID = decoded.id;

      let result = await Service.exportExcel(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetExportExcelWithFarmer(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      req.body.UserID = decoded.id;

      let result = await Service.exportExcelWithFarmer(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetSelection(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      req.body.UserID = decoded.id;

      let result = await Service.selection(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetAll(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      req.body.UserID = decoded.id;

      let result = await Service.find(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetById(req, res) {
    try {
      let result = await Service.findById(req.params.id);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onInsert(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      req.body.CreatedUserID = decoded.id;
      let result = await Service.insert(req.body);
      res.success(result, 201);
    } catch (error) {
      res.error(error);
    }
  },

  async onUpdate(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      req.body.UpdatedUserID = decoded.id;
      const result = await Service.update(req.params.id, req.body);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onDelete(req, res) {
    try {
      await Service.delete(req.params.id);
      res.success("success", 204);
    } catch (error) {
      res.error(error);
    }
  },

  async onGenerateNumber(req, res) {
    try {
      let result = await Service.GenerateNumber(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onPhoto(req, res) {
    try {
      const result = await Service.photo(req.params.id, req.file.filename);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
};

module.exports = { ...methods };
