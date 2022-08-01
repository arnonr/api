const Service = require("../services/Cart.service"),
  jwt = require("jsonwebtoken");

const methods = {
  async onGetAll(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      req.body.GetUserID = decoded.id;
      let result = await Service.find(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetById(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      req.body.GetUserID = decoded.id;
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
      // req.body.DeleteUserID = decoded.id;
      await Service.delete(req.body.AnimalID, decoded.id);
      res.success("success", 204);
    } catch (error) {
      res.error(error);
    }
  },
};

module.exports = { ...methods };
