const Service = require("../services/AI.service"),
  jwt = require("jsonwebtoken");
// TEST
const methods = {
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

        
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      const UpdatedUserID = decoded.id;

      await Service.delete(req.params.id, UpdatedUserID);
      res.success("success", 204);
    } catch (error) {
      res.error(error);
    }
  },
};

module.exports = { ...methods };
