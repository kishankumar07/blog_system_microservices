import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    postId: {
       type: mongoose.Schema.Types.ObjectId,
        required: true 
    },
    author: {
       type: String,
        required: true
   },
    content: {
       type: String,
        required: true 
    },
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model("Comment", commentSchema);
