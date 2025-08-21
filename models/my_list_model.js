import mongoose from "mongoose";

const my_list_schema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  product_title: {
    type: String,
    required: true,
  },
  product_brand: {
    type: String,
    required: true,
  },
  product_image: {
    type: String,
    required: true,
  },
  product_price: {
    type: Number,
    required: true,
  },
  product_rating: {
    type: Number,
    required: true,
  },
},{timestamps:true});

const my_list_model = mongoose.model('my_list', my_list_schema)

export default my_list_model