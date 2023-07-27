const mongoose = require("mongoose");
const logger = require("./../utils/logger.js");
const Counter = require("../models/counter/counterModel");
const Order = require("../models/order/orderModel");
const Coupon = require("../models/coupon/couponModel.js");
// const MongoClient = require('mongodb').MongoClient;
//hello this is sanjeev testing

const DB =
  process.env.NODE_ENV === "production"
    ? process.env.DB_URI_PROD.replace("<USERNAME>", process.env.MONGO_USERNAME)
        .replace("<PASSWORD>", process.env.MONGO_PASSWORD)
        .replace("<DBNAME>", process.env.DBNAME)
        .replace("<AUTH_MECH>", process.env.DB_AUTH_MECHANISM)
        .replace("<AUTH_SOURCE>", process.env.DB_AUTH_SOURCE)
    : process.env.DB_URI_DEV.replace("<DBNAME>", process.env.DBNAME);

// MongoClient.connect(`${DB}/${process.env.DBNAME}`, function (err, db) {
//   // Now you can use the database in the db variable
// });

console.log(DB);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false,
  })
  .then(() => logger.log("info", "Database Connection Successful!"))
  .catch((e) => logger.log("error", `${e.message} error occured`));
const ages = [3, 10, 18, 20];

ages.some(checkAdult);
//new changes from remote
function checkAdult(age) {
  return age > 18;
}
const connection = mongoose.connection;
connection.on("open", async () => {
  if (!(await Counter.findOne({ _id: "domain" }))) {
    let order = await Order.find().sort("-_id").limit(1);
    order = order[0];
    let sequence = order ? Number(order._id.split("-")[2]) : 1000;
    await new Counter({
      _id: "domain",
      sequence,
    }).save();

    logger.log("info", "New Counter Created!");
  }
  if ((await Coupon.find()).length === 0 && process.env.COUPON_CODE) {
    await new Coupon({
      code: process.env.COUPON_CODE,
      percent: +process.env.COUPON_CODE.split("-")[2],
    }).save();

    logger.log("info", "Coupon Added!");
  } else if ((await Coupon.find()).length > 0 && !process.env.COUPON_CODE) {
    await Coupon.deleteMany();
    logger.log("info", "Coupon Removed!");
  } else {
    const coupon = await Coupon.find();
    await Coupon.findByIdAndUpdate(coupon[0]._id, {
      code: process.env.COUPON_CODE,
      // percent: +process.env.COUPON_CODE.split('-')[2],
    });
  }
});
