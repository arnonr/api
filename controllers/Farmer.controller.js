const Service = require("../services/Farmer.service"),
  jwt = require("jsonwebtoken");

const methods = {
  async onGetBeforeAddFarm(req, res) {
    try {
      let result = await Service.findBeforeAddFarm(req);
      res.success(result, 201);
    } catch (error) {
      res.error(error);
    }
  },

  async onfetchAPIFarmer(req, res) {
    try {
      let result = await Service.fetchAPIFarmer();
      res.success(result, 201);
    } catch (error) {
      res.error(error);
    }
  },

  async onfetchAPIUpdateFarmerWithERegis(req, res) {
    try {
      let result = await Service.fetchAPIUpdateFarmerWithERegis(req);
      res.success(result, 201);
    } catch (error) {
      res.error(error);
    }
  },

  async onUpdateAllFarmerWithERegis(req, res) {
    try {
      let result = await Service.updateAllFarmerWithERegis();
      res.success(result, 201);
    } catch (error) {
      res.error(error);
    }
  },


  async onGetAll(req, res) {
    try {
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
};

module.exports = { ...methods };
