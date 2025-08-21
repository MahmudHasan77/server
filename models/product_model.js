import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: [{ type: String, required: true }],
  price: { type: Number, required: true },
  description: { type: String, required: true },
  old_price: { type: Number },
  category_name: { type: String, default: "" },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
  },
  category_id: { type: String, default: "" },
  type_name: { type: String, default: "" },
  type_id: { type: String, default: "" },
  brand: { type: String, default: "" },
  count_in_stock: { type: Number },
  rating: { type: Number, default: 0 },
  offer: { type: Boolean, default: false },
  NewArrivals: { type: Boolean, default: false },
  ram: { type: String },
  storage: { type: String },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now() },
});

const product_model =
  mongoose.models.product || mongoose.model("product", productSchema);

export default product_model;
