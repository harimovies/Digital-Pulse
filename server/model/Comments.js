const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  subscriber_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscriber",
  },
  subscriber_name: {
    type: String,
  },
  comment_content: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
