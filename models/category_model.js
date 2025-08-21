import mongoose from "mongoose";

const category_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: { type: String },
    parent_name: { type: String },
    parent_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      default: null,
    },
    // children: { type: Array },
  },
  { timestamps: true }
);

const category_model = mongoose.model("Category", category_schema);
export default category_model;
