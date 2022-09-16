const Service = require("../services/UserFarmer.service"),
  jwt = require("jsonwebtoken");


const methods = {
  async onGetAll(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      req.query.GetedUserID = decoded.id;

      let result = await Service.find(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onAuthorize(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      let result = await Service.authorize(decoded.id);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onCheckPermission(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      let result = await Service.CheckPermission(
        decoded.id,
        req.query.MenuID,
        req.query.Action
      );
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

  async onLogin(req, res) {
    try {
      // let clientIp = requestIp.getClientIp(req);
      // console.log(req.socket.remoteAddress);
      // console.log(req.ip)
      // console.log(clientIp);
      let useragent = req.useragent;
      let detectResult = req.device;

      let result = await Service.login(req.body, req.ip, detectResult);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onRegister(req, res) {
    try {
      let result = await Service.insert(req.body);
      res.success(result, 201);
    } catch (error) {
      res.error(error);
    }
  },

  async onRefreshToken(req, res) {
    try {
      let result = await Service.refreshToken(req.body.accessToken);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetByStaffID(req, res) {
    try {
      let result = await Service.findByStaffID(req.params.id);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
};

module.exports = { ...methods };
