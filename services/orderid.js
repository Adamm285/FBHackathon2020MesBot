
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subSchema = new Schema({
  response: { type: String, required: true },
  payload: { type: String },
  meats: { type: String },
  toppings: { type: String },
  combo: { type: String },
  heating: { type: String },
  date: { type: Date, default: Date.now }
});

const Sub = mongoose.model("Sub", subSchema);

module.exports = Sub;