import mongoose from "mongoose";

const second_slider_schema = new mongoose.Schema({
  title: { type: String },
  color: { type: String, default: "#000000" },
  image: { type: String, required: true },
  category: { type: String, required: true },
});

const secondSliderModel = mongoose.model("secondSlider", second_slider_schema);

export default secondSliderModel;
