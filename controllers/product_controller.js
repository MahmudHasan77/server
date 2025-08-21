import { v2 as cloudinary } from "cloudinary";

import product_model from "../models/product_model.js";
import review_model from "./../models/reviews_model.js";

/* add_product */
export const upload_product = async (req, res) => {
  const {
    name,
    price,
    old_price,
    category,
    category_name,
    category_id,
    type_name,
    type_id,
    brand,
    ram,
    storage,
    count_in_stock,
    rating,
    isAvailable,
    offer,
    description,
    NewArrivals,
  } = req.body;
  try {
    const images = req.files;
    if (!name || !price || !description) {
      return res.json({
        success: false,
        message: "name and price and description are required",
      });
    }
    if (!images.length) {
      return res.json({ success: false, message: "image is required" });
    }

    //  save in  cloudinary
    const image_url = await Promise.all(
      images.map(async (img) => {
        return (
          await cloudinary.uploader.upload(img.path, { resource_type: "image" })
        ).secure_url;
      })
    );

    const upload_product = new product_model({
      name,
      price: Number(price),
      old_price: Number(old_price),
      description,
      category,
      category_name,
      category_id,
      type_name,
      type_id,
      ram,
      storage,
      rating,
      brand,
      isAvailable,
      count_in_stock,
      images: image_url,
      offer,
      NewArrivals,
    });

    const save_product = await upload_product.save();
    if (!save_product) {
      return res.json({ success: false, message: "something wrong try again" });
    }
    res.json({
      success: true,
      status: 200,
      message: `${name} is uploaded successfully`,
    });
  } catch (error) {
    res.json({
      success: false,
      status: 500,
    });
    console.log(error);
  }
};
/** add_product */

/** update_product */
export const update_product = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      price,
      old_price,
      category,
      category_name,
      category_id,
      type_name,
      type_id,
      brand,
      ram,
      storage,
      count_in_stock,
      rating,
      isAvailable,
      offer,
      description,
      existing_image,
      NewArrivals,
    } = req.body;

    const images = req.files;

    if (!name || !price || !description) {
      return res.json({
        success: false,
        message: "name, price, and description are required",
      });
    }

    const product = await product_model.findById(id);
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found with this ID" });
    }

    // 🔁 Handle existing images from frontend
    let existingImages = existing_image;
    if (!existingImages) {
      existingImages = [];
    } else if (typeof existingImages === "string") {
      existingImages = [existingImages];
    }

    // 🔥 Purge only removed images from Cloudinary
    const removedImages = product.images.filter(
      (img) => !existingImages.includes(img)
    );

    for (const img of removedImages) {
      const publicId = img.split("/").pop().split(".")[0]; // last part before .ext
      await cloudinary.uploader.destroy(publicId);
    }

    // 📤 Upload new images
    let newImageUrls = [];
    if (images && images.length > 0) {
      newImageUrls = await Promise.all(
        images.map(async (img) => {
          const result = await cloudinary.uploader.upload(img.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
    }

    // 🔗 Combine old and new images
    const finalImages = [...existingImages, ...newImageUrls];

    // ❌ No image? Reject the request
    if (finalImages.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required." });
    }

    const updatedProduct = await product_model.findByIdAndUpdate(
      id,
      {
        name,
        price: Number(price),
        old_price: Number(old_price),
        description,
        category,
        category_name,
        category_id,
        type_name,
        type_id,
        ram,
        storage,
        rating,
        brand,
        isAvailable,
        count_in_stock,
        images: finalImages,
        offer,
        NewArrivals,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(500)
        .json({ success: false, message: "something wrong try again" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "something wrong try again" });
  }
};

/** update_product */

// /* get_all_product  */
export const get_all_products = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const per_page = Number(req.query.per_page) || 20;

    const total_product_count = await product_model.countDocuments();
    const total_page = Math.ceil(total_product_count / per_page);

    if (page > total_page) {
      return res.status(404).json({
        success: false,
        message: "Page not found!",
      });
    }

    const total_product = await product_model
      .find()
      .populate("category")
      .skip((page - 1) * per_page)
      .limit(per_page)
      .exec();

    return res.status(200).json({
      success: true,
      message: total_product.length
        ? "Product list fetched."
        : "No products found.",
      page_info: {
        current_page: page,
        total_pages: total_page,
      },
      total_product_count,
      total_product,
    });
  } catch (error) {
    console.error("Error in get_all_products:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

/** get_all_product  */

/**get_product_by_category_id */
export const get_product_by_category_id = async (req, res) => {
  try {
    const id = req.params.id;
    const page = Number(req.query.page) || 1;
    const per_page = Number(req.query.per_page) || 5;
    console.log(page);
    const total_product_count = await product_model.countDocuments({
      category_id: id,
    });

    const total_page = Math.ceil(total_product_count / per_page);

    const total_product = await product_model
      .find({ category_id: id })
      .populate("category")
      .skip((page - 1) * per_page)
      .limit(per_page)
      .exec();
    if (!total_product) {
      return res
        .status(404)
        .json({ success: false, message: "product not found" });
    }

    return res.status(200).json({
      success: true,
      message: total_product.length
        ? "Product list fetched."
        : "No products found.",
      page_info: {
        current_page: page,
        total_pages: total_page,
      },
      total_product_count,
      total_product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "something wrong try again" });
    console.log(error);
  }
};
/**get_product_by_category_id */

/**get_product_by_type_id */
export const get_product_by_type_id = async (req, res) => {
  const id = req.params.id;
  try {
    const products = await product_model
      .find({ type_id: id })
      .populate("category");

    if (!products) {
      return res
        .status(404)
        .json({ success: false, message: "product not found" });
    }

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "something wrong try again" });
    console.log(error);
  }
};
/**get_product_by_type_id */

/**get_product_by_category_name */
export const get_product_by_category_name = async (req, res) => {
  try {
    const category_name = req.query.category_name;
    const page = Number(req.query.page) || 1;
    const per_page = Number(req.query.per_page) || 5;
    const total_product_count = await product_model.countDocuments({
      category_name,
    });
    const total_page = Math.ceil(total_product_count / per_page);
    if (page > total_page) {
      return res.json({
        success: false,
        status: 404,
        message: "page not found !",
      });
    }
    const total_product = await product_model
      .find({ category_name })
      .populate("category")
      .skip((page - 1) * per_page)
      .limit(per_page)
      .exec();
    if (!total_product) {
      return res
        .status(404)
        .json({ success: false, message: "product not found" });
    }
    res.status(200).json({
      success: true,
      total_page,
      total_product_count,
      page_number: `page_number ${page} of ${total_page}`,
      total_product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "something wrong try again" });
    console.log(error);
  }
};
/**get_product_by_category_name */

/**get_product_by_type_name */
export const get_product_by_type_name = async (req, res) => {
  try {
    const type_name = req.query.type_name;
    const page = Number(req.query.page) || 1;
    const per_page = Number(req.query.per_page) || 5;
    const total_product_count = await product_model.countDocuments({
      type: type_name,
    });
    const total_page = Math.ceil(total_product_count / per_page);
    if (page > total_page) {
      return res.json({
        success: false,
        status: 404,
        message: "page not found !",
      });
    }
    const total_product = await product_model
      .find({ type: type_name })
      .populate("category")
      .skip((page - 1) * per_page)
      .limit(per_page)
      .exec();
    if (!total_product) {
      return res
        .status(404)
        .json({ success: false, message: "product not found" });
    }
    res.status(200).json({
      success: true,
      total_page,
      total_product_count,
      page_number: `page_number ${page} of ${total_page}`,
      total_product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "something wrong try again" });
    console.log(error);
  }
};
/**get_product_by_type_name */

/**  filter_products */
export const filter_product = async (req, res) => {
  try {
    // Query params
    const min_price = req.query.min_price
      ? Number(req.query.min_price)
      : undefined;
    const max_price = req.query.max_price
      ? Number(req.query.max_price)
      : undefined;
    const min_rating = req.query.min_rating
      ? Number(req.query.min_rating)
      : undefined;
    const category_id = req.query.category_id;
    const NewArrivals = req.query.NewArrivals;
    const ram = req.query.ram; // e.g., "4GB,8GB"
    const storage = req.query.storage; // e.g., "4GB,8GB"
    const offer = req.query.offer;
    const isAvailable = req.query.isAvailable;

    // Build query
    let query = {};

    // Price
    if (min_price !== undefined || max_price !== undefined) {
      query.price = {};
      if (min_price !== undefined) query.price.$gte = min_price;
      if (max_price !== undefined) query.price.$lte = max_price;
    }

    // Rating
    if (min_rating !== undefined) {
      query.rating = { $gte: min_rating };
    }

    // Category
    if (category_id) {
      query.category_id = category_id;
    }
    if (NewArrivals) {
      query.NewArrivals = true;
    }

    // RAM (Multiple with $in)
    if (ram) {
      const ramValues = ram.split(",").map((value) => value.trim());
      query.ram = { $in: ramValues };
    }
    if (storage) {
      const ramValues = storage.split(",").map((value) => value.trim());
      query.storage = { $in: ramValues };
    }

    // Offer
    if (offer === "true") query.offer = true;
    else if (offer === "false") query.offer = false;

    // isAvailable
    if (isAvailable === "true") query.isAvailable = true;
    else if (isAvailable === "false") query.isAvailable = false;

    const products = await product_model.find(query).populate("category");

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
/**  filter_product_with_pagination */

/*  filter_product_with_pagination */
export const filter_product_with_pagination = async (req, res) => {
  const { categories, types, ratings, prices } = req.body;
  const search = req.query.search || "";
  const sorting = req.query.sort;

  try {
    const page = Number(req.query.page) || 1;
    const per_page = Number(req.query.per_page) || 20;
    const skip = (page - 1) * per_page;

    const andConditions = [];

    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      });
    }

    if (categories?.length) {
      andConditions.push({ category_id: { $in: categories } });
    }

    if (types?.length) {
      andConditions.push({ type_id: { $in: types } });
    }

    if (ratings?.length) {
      andConditions.push({ rating: { $in: ratings.map(Number) } });
    }
    if (prices?.length === 2) {
      andConditions.push({ price: { $gte: prices[0], $lte: prices[1] } });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    // Sorting
    let sortOption = {};
    if (sorting === "ascending") sortOption.price = 1;
    else if (sorting === "descending") sortOption.price = -1;

    // Count and fetch
    const total_products = await product_model.countDocuments(query);
    const total_pages = Math.ceil(total_products / per_page);

    if (page > total_pages && total_products !== 0) {
      return res.status(404).json({
        success: false,
        message: `Page number ${page} not found`,
      });
    }

    const products = await product_model
      .find(query)
      .sort(sortOption)
      .populate("category")
      .skip(skip)
      .limit(per_page);

    const start_product_number = total_products === 0 ? 0 : skip + 1;
    const end_product_number = skip + products.length;

    return res.status(200).json({
      success: true,
      total_products,
      total_pages,
      page_number: page,
      per_page,
      showing: `Showing products ${start_product_number} to ${end_product_number}`,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error:error,
      success: false,
      message: "Something went wrong",
    });
  }
};

/*  filter_product_with_pagination */

/**  get_single_product */
export const get_single_product = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await product_model.findById(id).populate("category");
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "something wrong try again" });
  }
};
/**  get_single_product */

/**  delete_product */
export const delete_product = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await product_model.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "product not found" });
    }
    for (const img of product?.images) {
      const urlArr = img.split("/");
      const imag = urlArr[urlArr.length - 1].split(".")[0];
      const result = await cloudinary.uploader.destroy(imag);
      if (!result) {
        return res
          .status(500)
          .json({ success: false, message: "something wrong try again" });
      }
    }
    const deleted_product = await product_model.findByIdAndDelete(id);
    if (!deleted_product) {
      return res
        .status(500)
        .json({ success: false, message: "something wrong try again" });
    }
    res
      .status(200)
      .json({ success: true, message: "product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "something wrong " });
  }
};
/**  delete_product */

/*  delete_multiple_product */
export const delete_multiple_product = async (req, res) => {
  const ids = req.body.ids;
  try {
    for (const id of ids) {
      const product = await product_model.findById(id);
      for (const img of product?.images) {
        const urlArr = img.split("/");
        const imag = urlArr[urlArr.length - 1].split(".")[0];
        const result = await cloudinary.uploader.destroy(imag);
        if (!result) {
          return res
            .status(500)
            .json({ success: false, message: "something wrong try again" });
        }
      }
    }

    const deleted_multiple_product = await product_model.deleteMany({
      _id: ids,
    });
    if (!deleted_multiple_product.acknowledged) {
      return res
        .status(500)
        .json({ success: false, message: "something wrong try again" });
    }
    res.status(201).json({
      success: true,
      message: "product deleted",
      deleted_multiple_product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "something wrong " });
    console.log(error);
  }
};
/*  delete_multiple_product */

/*  get_latest_ten_product */
export const get_latest_ten_product = async (req, res) => {
  try {
    const products = await product_model
      .find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(201).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong " });
  }
};
/*  get_latest_ten_product */

/*  add_review */
export const add_review = async (req, res) => {
  const { review, product_id, rating } = req.body;
  const images = req.files;
  const user_id = req.user_id;
  try {
    const existingReview = await review_model.findOne({ user_id, product_id })
    if (existingReview) {
            return res
          .status(400)
          .json({ success: false, message: "Already you  commented" });
      
    }
    let image_url = [];
    for (const img of images) {
      const result = (
        await cloudinary.uploader.upload(img.path, { resource_type: "image" })
      ).secure_url;
      image_url.push(result);
    }

    const added_review = await new review_model({
      review,
      product_id,
      user_id,
      rating,
      images: image_url,
    });
    const save_review = await added_review.save();
    if (!save_review) {
      return res
        .status(500)
        .json({ success: false, message: "something went wrong try again" });
    }
    res
      .status(201)
      .json({ success: true, message: "Review Added successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "something went wrong 1 " });
  }
};
/*  add_review */

/*  get_review */
export const get_review = async (req, res) => {
  try {
    const reviews = await review_model
      .find({ product_id: req.params.id })
      .populate("user_id", "name email profile_image"); // populate only required fields
    if (!reviews.length) {
      return res.status(404).json({
        success: false,
        message: "No reviews found for this product",
      });
    }

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Get Review Error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

/*  get_review */

// get_all_product_count;

export const get_all_product_count = async (req, res) => {
  try {
    const productsCount = await product_model.countDocuments();
    res.status(201).json({ success: true, productsCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
