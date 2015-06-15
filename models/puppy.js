var mongoose = require("mongoose");

var puppySchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
  ownerId: String
});

var Puppy = mongoose.model("Puppy", puppySchema);

module.exports = Puppy;