import mongoose from "mongoose";

const blog_schema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    image: { type: String },

    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const blog_model = mongoose.model("blog", blog_schema);
export default blog_model;
