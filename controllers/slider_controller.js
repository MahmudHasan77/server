import slider_model from "../models/home_slider_model.js";
import { v2 as cloudinary } from "cloudinary";
import secondSliderModel from "../models/second_slider_model.js";

export const add_slider = async (req, res) => {
  try {
    const image = req.files[0];

    const result = await cloudinary.uploader.upload(image.path, {
      resource_type: "image",
    });
    const image_url = result.secure_url;

    const new_slider = new slider_model({
      name: req.body.name,
      Title: req.body.Title,
      TextColor: req.body.TextColor,
      TextAlign: req.body.TextAlign,
      image: image_url,
    });
    const save_slider = await new_slider.save();
    if (!save_slider) {
      res.status(500).json({
        success: false,
        message: "something went wrong",
      });
    }
    res
      .status(200)
      .json({ success: true, message: "slider added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong" });
  }
};

export const add_second_slider = async (req, res) => {
  try {
    const { title, textColor, category } = req.body;
    const image = req.files[0];
    const imageUrl = await (await cloudinary.uploader.upload(image.path,{resource_type:'image'})).secure_url
    const new_slider = new secondSliderModel({
      title,
      color:textColor,
      category,
      image: imageUrl,
    });
    const save_slider = await new_slider.save();
    if (!save_slider) {
      res.status(500).json({
        success: false,
        message: "something went wrong",
      });
    }
    res
      .status(200)
      .json({ success: true, message: "slider added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong" });
  }
};

export const get_home_slider = async (req, res) => {
  try {
    const sliders = await slider_model.find();

    res.status(200).json({ success: true, sliders });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong" });
  }
};
export const get_second_slider = async (req, res) => {
  try {
    const sliders = await secondSliderModel.find();

    res.status(200).json({ success: true, sliders });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong" });
  }
};
export const delete_slider = async (req, res) => {
  const id = req.params.id;
  try {
    const slider = await slider_model.findById(id);
    const urlArr = slider.image.split("/");
    const public_url = urlArr[urlArr.length - 1].split(".")[0];
    await cloudinary.uploader.destroy(public_url);

    const deleted_slider = await slider_model.findByIdAndDelete(id);
    if (!deleted_slider) {
      res.status(500).json({
        success: false,
        message: "something went wrong",
      });
    }
    res
      .status(200)
      .json({ success: true, message: "slider added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong" });
  }
};
export const delete_second_slider = async (req, res) => {
  const id = req.params.id;
  try {
    const slider = await secondSliderModel.findById(id);
    const urlArr = slider.image.split("/");
    const public_url = urlArr[urlArr.length - 1].split(".")[0];
    await cloudinary.uploader.destroy(public_url);

    const deleted_slider = await secondSliderModel.findByIdAndDelete(id);
    if (!deleted_slider) {
      res.status(500).json({
        success: false,
        message: "something went wrong",
      });
    }
    res
      .status(200)
      .json({ success: true, message: "slider added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong" });
  }
};
