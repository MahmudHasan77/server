import my_list_model from "../models/my_list_model.js";

/*  add_to_my_list */
export const add_to_my_list = async (req, res) => {
  try {
    const user_id = req.user_id;
    const {
      product_id,
      product_title,
      product_brand,
      product_image,
      product_price,
      product_rating,
    } = req.body;

    if (!product_id) {
      return res
        .status(400)
        .json({ success: false, message: "Provide product ID" });
    }

    const check_product = await my_list_model.findOne({ product_id, user_id });

    if (check_product) {
      return res
        .status(409)
        .json({ success: false, message: "Product Already in List" });
    }

    const create_my_list = new my_list_model({
      user_id,
      product_id,
      product_title,
      product_brand,
      product_image,
      product_price: Number(product_price) || 0,
      product_rating: Number(product_rating) || 0,
    });

    const save_my_list = await create_my_list.save();

    if (!save_my_list) {
      return res.status(500).json({
        success: false,
        message: "something wrong try again",
      });
    }

    res.status(201).json({
      success: true,
      message: "Product added to My List successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong " });
    console.log(error);
  }
};
/*  add_to_my_list */

/*  delete_my_list */
export const delete_my_list = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Provide Product List ID" });
    }

    const delete_List = await my_list_model.findByIdAndDelete(id);

    if (!delete_List) {
      return res.status(404).json({
        success: false,
        message: "Product not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted from List successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
    console.log(error);
  }
};
/*  delete_my_list */

/*  get_my_list */
export const get_my_list = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ success: false, message: "Provide List ID" });
    }
    const my_list = await my_list_model.findById(req.params.id);
    if (!my_list) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(201).json({ success: true, data: my_list });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
    console.log(error);
  }
};
/*  get_my_list */
