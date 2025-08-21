import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  address_line: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  PINcode: {
    type: String,
  },
  mobile: {
    type: Number,
    default: null,
  },
  user_id: {
    type: String,
    ref: "user",
  },
  status: {
    type: Boolean,
    default: true,
    },
  
},{timestamps:true});

const AddressModel = mongoose.model('address', addressSchema)
export default AddressModel