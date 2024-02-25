const Service = require("../services/Staff.service"),
  jwt = require("jsonwebtoken");

const methods = {
  async onGetSelection(req, res) {
    try {
      let result = await Service.selection(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetAllCount(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      req.query.GetedUserID = decoded.id;

      let result = await Service.findCount(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

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
      // const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      req.body.CreatedUserID = 1;
      let result = await Service.insert(req.body);
      res.success(result, 201);
    } catch (error) {
      res.error(error);
    }
  },

  async onUpdate(req, res) {
    try {
      if (req.headers.authorization) {
        const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);

        if (decoded) {
          if (decoded.id) {
            req.body.UpdatedUserID = decoded.id;
          } else {
            req.body.UpdatedUserID = 1;
          }
        } else {
          req.body.UpdatedUserID = 1;
        }
      }else{
        req.body.UpdatedUserID = 1;
      }

      const result = await Service.update(req.params.id, req.body);
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

  async onDelete(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      UpdatedUserID = decoded.id;
      await Service.delete(req.params.id, UpdatedUserID);
      res.success("success", 204);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetByStaffNumber(req, res) {
    try {
      let result = await Service.findByStaffNumber(req.params.id);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetByStaffNumber2(req, res) {
    try {
      let result = await Service.findByStaffNumber2(req.params.id);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onUpdateMobilePhone(req, res) {
    try {
      const result = await Service.update(req.params.id, req.body);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGenerateStaffNumber(req, res) {
    try {
      let result = await Service.generateStaffNumber(
        req.query.StaffID,
        req.query.isCard
      );
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
};

module.exports = { ...methods };
