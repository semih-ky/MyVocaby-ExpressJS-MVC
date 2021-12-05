const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vocabularySchema = new Schema({
  word: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  definition: {
    type: String,
    required: true
  },
  example: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Vocabulary", vocabularySchema);