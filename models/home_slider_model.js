import mongoose from "mongoose";

const slider_schema = new mongoose.Schema({
  Title: {
    type: String,
  },
  TextAlign: {
    type: String,default:'left'
  },
  TextColor: {
    type: String,
  },
  image: { type: String, required: true },
});

const slider_model = mongoose.model("slider", slider_schema);


export default slider_model