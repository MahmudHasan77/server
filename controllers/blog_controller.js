import { v2 as cloudinary } from "cloudinary";
import blog_model from "../models/blog_model.js";

export const add_blog = async (req, res) => {
  const { title, description } = req.body;
  const image = req.files[0];

  try {
    const image_url = (
      await cloudinary.uploader.upload(image.path, { resource_type: "image" })
    ).secure_url;
    const new_blog = await blog_model({
      title,
      description,
      image: image_url,
    });

    const save_blog = await new_blog.save();
    if (!save_blog) {
      return res
        .status(500)
        .json({ success: false, message: "something went wrong try again" });
    }
    res
      .status(201)
      .json({ success: true, message: "your blog added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong" });
  }
};

export const get_blog = async (req, res) => {
  try {
    const blogs = await blog_model.find();
    if (blogs.length == 0) {
      return res.status(500).json({
        success: false,
        message: "something went wrong try again",
      });
    }
    res.status(201).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong" });
  }
};

export const delete_blog = async (req, res) => {
  const id = req.params.id;
  try {
    if (!req.params.id) {
      return res.status(500).json({
        success: false,
        message: "something went wrong try again",
      });
    }
    const blog = await blog_model.findById(id);
    const urlArr = blog.image.split("/");
    const public_url = urlArr[urlArr.length - 1].split(".")[0];
    await cloudinary.uploader.destroy(public_url);

    await blog_model.findByIdAndDelete(id);
    res
      .status(201)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong" });
  }
};

export const update_blog = async (req, res) => {
  const id = req.params.id;
  const { title, description } = req.body;
  const image = req.files[0];
  try {
    const blog = await blog_model.findById(id);
    let image_url = "";
    if (image) {



    const urlArr = blog.image.split("/");
    const public_url = urlArr[urlArr.length - 1].split(".")[0];
    await cloudinary.uploader.destroy(public_url);

      image_url = (
        await cloudinary.uploader.upload(image.path, {
          resource_type: "image",
        })
      ).secure_url;
    } else {
      image_url = blog?.image;
    }

    const updated_blog = await blog_model.findByIdAndUpdate(id, {
      title,
      description,
      image: image_url,
    });
    if (!updated_blog) {
      res.status(500).json({ success: false, message: "something went wrong" });
    }
    res
      .status(201)
      .json({ success: true, message: "Blog updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong" });
  }
};
