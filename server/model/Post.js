const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PostSchema = new Schema({
  articleType: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  synopsis: {
    type: String,
  },
  body: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  filename: {
    type: String,
  },
  filepath: {
    type: String,
  },
});
module.exports = mongoose.model("Post", PostSchema);
