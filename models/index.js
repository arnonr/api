// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../configs/databases")
// const db = require("../configs/databases");
// // db
// db.Users.associate();
const Sequelize = require("sequelize"),
  { sequelize } = require("../configs/databases");

// // ห้าม force เป็น true เด็ดขาด ข้อมูลจะถูกรีเซต
// db.sequelize.sync({force: false}).then(() => {
//     console.log('yes re-sync done!')
// })

const Province = require("./Province");
const Amphur = require("./Amphur");
const Tumbol = require("./Tumbol");
const Region = require("./Region");
const AIZone = require("./AIZone");
const OrganizationType = require("./OrganizationType");
const OrganizationZone = require("./OrganizationZone");
const Organization = require("./Organization");

const Staff = require("./Staff");
const Title = require("./Title");
const Gender = require("./Gender");
const MarriedStatus = require("./MarriedStatus");
const PositionType = require("./PositionType");
const Position = require("./Position");
const Education = require("./Education");
const Occupation = require("./Occupation");

const User = require("./User");
const Menu = require("./Menu");
const Group = require("./Group");
const GroupAuthorize = require("./GroupAuthorize");

const Project = require("./Project");
const ProjectToAnimalType = require("./ProjectToAnimalType");
const UserToAnimalType = require("./UserToAnimalType");

const FarmStatus = require("./FarmStatus");
const Farm = require("./Farm");
const FarmToProject = require("./FarmToProject");
const Farmer = require("./Farmer");
//
const AnimalGenre = require("./AnimalGenre");
const AnimalSex = require("./AnimalSex");
const AnimalGroupType = require("./AnimalGroupType");
const AnimalType = require("./AnimalType");
const AnimalBreed = require("./AnimalBreed");
const AnimalStatus = require("./AnimalStatus");
const AnimalStatusToAnimalType = require("./AnimalStatusToAnimalType");
const AnimalStatusToAnimalSex = require("./AnimalStatusToAnimalSex");
const Animal = require("./Animal");
const AnimalToProject = require("./AnimalToProject");
// 

// Associate
Province.associate({ Region, AIZone, OrganizationZone });
Tumbol.associate({ Amphur, Province });
Amphur.associate({ Province });

Organization.associate({
  OrganizationType,
  OrganizationZone,
  Amphur,
  Province,
  Tumbol,
});

Staff.associate({
  Title,
  Gender,
  MarriedStatus,
  Organization,
  PositionType,
  Position,
  Amphur,
  Province,
  Tumbol,
  Education,
});

User.associate({ Staff, Group, UserToAnimalType });
Group.associate({ User, GroupAuthorize });
GroupAuthorize.associate({ Group, Menu });
Project.associate({ Organization, ProjectToAnimalType });

Farm.associate({
  FarmStatus,
  Amphur,
  Province,
  Tumbol,
  OrganizationZone,
  Organization,
  AIZone,
  FarmToProject,
});

Farmer.associate({
  Farm,
  Amphur,
  Province,
  Tumbol,
  Title,
  Gender,
  Occupation,
});

//

AnimalGroupType.associate({ AnimalGenre });
AnimalType.associate({ AnimalGenre, AnimalGroupType });
AnimalBreed.associate({ AnimalType });
AnimalStatus.associate({ AnimalStatusToAnimalType, AnimalStatusToAnimalSex });
Animal.associate({
  AnimalSex,
  Farm,
  Animal,
  AnimalBreed,
  Organization,
  OrganizationZone,
  AnimalToProject,
  AnimalStatus,
  AnimalType,
});

(async () => {
  await sequelize.sync();
  // Code here
})();

// module.exports = db
