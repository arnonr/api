const Service = require("../services/Animal.service"),
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

  async onGetAllNotEvent(req, res) {
    try {
      let result = await Service.findNotEvent(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetAllIDandName(req, res) {
    try {
      let result = await Service.findAllIDandName(req);
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
      let result = await Service.GenerateNumber(
        req.query.FarmID,
        req.query.BirthDate,
        req.query.AnimalTypeID
      );
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onGetLatestNumber(req, res) {
    try {
      let result = await Service.getLatestNumber(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onGenerateBreed(req, res) {
    try {
      let result = await Service.GenerateBreed(
        req.query.AnimalFatherID,
        req.query.AnimalMotherID
      );
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetByFarmID(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      req.body.GetUserID = decoded.id;

      let result = await Service.findByFarmID(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetByFarmID1(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      req.body.GetUserID = decoded.id;

      let result = await Service.findByFarmID1(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onExportRegisteredAnimal(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      // let result = await Service.findById(req.params.id);
      let result = await Service.exportRegisteredAnimal(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onPhoto(req, res) {
    try {
      //   console.log(req.files+"FREEDOM50");
      const result = await Service.photo(req);
      //   const result = await Service.photo(req.params.id, req.file.filename);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onUpdateAnimalEvent(req, res) {
    try {
      const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      req.body.GetUserID = decoded.id;

      let result = await Service.updateAnimalEvent(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onUpdateAnimalNotification(req, res) {
    try {
      //   const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      //   req.body.GetUserID = decoded.id;

      let result = await Service.updateAnimalNotification(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onUpdateAnimalStatus(req, res) {
    try {
      //   const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
      //   req.body.GetUserID = decoded.id;

      let result = await Service.updateAnimalStatus(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
};

module.exports = { ...methods };
