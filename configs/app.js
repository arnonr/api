require('dotenv').config()
// ดึงตัวแปรมาจาก .env
module.exports = {
  port: process.env.PORT || 80,
  isProduction: process.env.NODE_ENV === 'production',
  apiVersion: process.env.API_VERSION || 1,
  token_exp_days: process.env.TOKEN_EXP_DAYS || 1,
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'my-secret',
  mongodbUri: process.env.MONGODB_URI,
  // pageLimit: process.env.PAGE_LIMIT || 100,
  DbHostname:  process.env.DB_HOSTNAME,
  DbPort:  process.env.DB_PORT,
  DbUsername: process.env.DB_USERNAME,
  DbPassword: process.env.DB_PASSWORD,
  DbDatabase: process.env.DB_NAME,
  UploadPath:  "http://bblp-aidm.dld.go.th/api/static/uploads"//process.env.UPLOAD_PATH,
}