const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ArticleSchema = new Schema({
  articleType: {
    type: String,
  },
  filename: {
    type: String,
  },
  filepath: {
    type: String,
  },
});
module.exports = mongoose.model("Artilce", ArticleSchema);
