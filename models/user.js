const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  words: [{
    word: {
      type: Schema.Types.ObjectId,
      ref: "Vocabulary",
      required: true
    },
    history: {
      type: Date,
      required: true
    }
  }]
});

module.exports = mongoose.model("User", userSchema);