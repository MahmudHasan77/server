import { v2 as cloudinary } from "cloudinary";
import category_model from "../models/category_model.js";

export const create_category = async (req, res) => {
  try {
    const image = req.files[0];
    const { name, parent_id } = req.body;
    if (!image) {
      return res.json({ message: "category image is required" });
    }
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };
    if (!name) {
      return res.json({ success: false, message: "category name is required" });
    }
    let image_url = [];
    const result = await cloudinary.uploader.upload(image.path, options);
    image_url.push(result.secure_url);
    if (!image_url) {
      return res.json({ success: false, message: "not uploaded try again" });
    }
    const uploaded_category = new category_model({
      name,
      image: image_url[0],
      parent_id,
    });
    await uploaded_category.save();
    res.json({
      success: true,
      message: "created category successfully",
      uploaded_category,
    });
  } catch (error) {
    res.json({ success: false, message: "something wrong " });
    console.log(error);
  }
};

export const get_categories = async (req, res) => {
  try {
    const categories = await category_model.find();

    const map = {};
    const roots = [];

    categories.forEach((cat) => {
      map[cat._id] = { ...cat._doc, children: [] };
    });

    categories.forEach((cat) => {
      if (cat.parent_id && map[cat.parent_id]) {
        map[cat.parent_id].children.push(map[cat._id]);
      } else {
        roots.push(map[cat._id]);
      }
    });
    res.status(200).json({
      success: true,
      categories: roots,
    });
  } catch (error) {
    console.error("Error in get_categories:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const count_category = async (req, res) => {
  try {
    const categories = await category_model.countDocuments({
      parent_id: undefined,
    });
    res.json({ success: true, message: "categories ", data: categories });
  } catch (error) {
    res.json({ success: false, message: "something wrong" });
  }
};

export const get_type = async (req, res) => {
  try {
    const categories = await category_model.find();
    const types = categories.filter((cat) => {
      return cat.parent_id !== undefined;
    });
    res.status(201).json({ success: true, message: "categories ", types });
  } catch (error) {
    res.json({ success: false, message: "something wrong" });
    console.log(error);
  }
};

export const get_category_by_id = async (req, res) => {
  const id = req.params.id;
  try {
    const single_category = await category_model.findById(id);
    if (!single_category) {
      return res.json({ success: false, message: "category not found " });
    }
    res.json({ success: true, single_category });
  } catch (error) {
    res.json({ success: false, message: "something wrong" });
    console.log(error);
  }
};

export const delete_category = async (req, res) => {
  const id = req.params.id;
  try {
    const all_category = await category_model.find();
    const all_types = all_category.filter((cat) => {
      return cat.parent_id == id;
    });
    const image_url = [];
    for (const type of all_types) {
      image_url.push(type.image);
    }
    for (const single_url of image_url) {
      const urlArr = single_url.split("/");
      const public_url = urlArr[urlArr.length - 1].split(".")[0];
      await cloudinary.uploader.destroy(public_url);
    }
    for (const type of all_types) {
      await category_model.findByIdAndDelete(type._id);
    }

    const category = await category_model.findById(id);
    const urlArr = category.image.split("/");
    const public_url = urlArr[urlArr.length - 1].split(".")[0];
    await cloudinary.uploader.destroy(public_url);
    const deleted_category = await category_model.findByIdAndDelete(id);
    if (!deleted_category) {
      return res.json({ success: false, message: "something wrong try again" });
    }
    res.json({ success: true, message: "category deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: "something wrong" });
    console.log(error);
  }
};

export const update_category = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, parent_id } = req.body;
    const category_image = req.files[0];
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };
    const category = await category_model.findById(id);
    if (!category) {
      return res.json({ success: false, message: "category not found " });
    }
    let new_image_url = "";

    if (category_image) {
      const urlArr = category.image.split("/");
      const public_url = urlArr[urlArr.length - 1].split(".")[0];
      const result = await cloudinary.uploader.destroy(public_url);
      if (!result) {
        return res.json({
          success: false,
          message: "something wrong try again",
        });
      }
      const uploaded_image_in_cloudinary = await cloudinary.uploader.upload(
        category_image.path,
        options
      );
      new_image_url = uploaded_image_in_cloudinary.secure_url;
    }

    const updated_category = await category_model.findByIdAndUpdate(id, {
      name: name ? name : category.name,
      image: category_image ? new_image_url : category.image,
      parent_id,
    });
    if (!updated_category) {
      return res.json({ success: false, message: "something wrong try again" });
    }
    res.json({ success: true, message: "category updated successfully" });
  } catch (error) {
    res.json({ success: false, message: "something wrong" });
    console.log(error);
  }
};
