import cart_product_model from "../models/cart_product_model.js";
import userModel from "../models/user_model.js";

/*add_to_cart */
export const add_to_cart = async (req, res) => {
  try {
    const user_id = req.user_id;
    const { product_id } = req.body;

    if (!product_id || !user_id) {
      return res
        .status(400)
        .json({ success: false, message: "Provide product id amd user id" });
    }

    const existing_item = await cart_product_model.findOne({
      product_id,
      user_id,
    });
    if (existing_item) {
      return res
        .status(409)
        .json({ success: false, message: "Product already in cart" });
    }

    const new_cart_item = new cart_product_model({
      product_id,
      quantity: 1,
      user_id,
    });

    const saved_cart = await new_cart_item.save();
    if (!saved_cart) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong, try again" });
    }

    await userModel.updateOne(
      { _id: user_id },
      { $addToSet: { shopping_cart: product_id } } // $push → $addToSet
    );

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart: saved_cart,
    });
  } catch (error) {
    console.error("Cart Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
/*add_to_cart */

/*  get_cart */
export const cart_info = async (req, res) => {
  try {
    const user_id = req.user_id;
    const cart_info = await cart_product_model
      .find({ user_id })
      .populate("product_id");
    res.status(200).json({ success: true, carts: cart_info });
  } catch (error) {
    console.error("Cart Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
/*  get_cart */

/*  update_cart_info */
export const update_cart_info = async (req, res) => {
  try {
    const user_id = req.user_id;
    const product_id = req.params.id;
    const type = req.body.type;
    if (!product_id) {
      return res.json({
        success: false,
        message: " Provide Product id  ",
      });
    }

    const incValue = type === "increase" ? 1 : -1;
    const updated = await cart_product_model.findOneAndUpdate(
      { product_id, user_id },
      { $inc: { quantity: incValue } },
      { new: true }
    );
    // console.log(updated);
    res.status(200).json({
      success: true,
      message: "cart updated successfully",
      updated,
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
/*  update_cart_info */

/*  delete_cart */
export const delete_cart = async (req, res) => {
  try {
    const user_id = req.user_id;
    const product_id = req.params.id;

    // Check if cart_id is provided
    if (!product_id) {
      return res
        .status(409)
        .json({ success: false, message: "Please provide cart id" });
    }

    // Delete the cart item from cart_product_model
    const cart = await cart_product_model.findOne({
      product_id,
      user_id,
    });
    const deleted_cart = await cart_product_model.deleteOne({
      product_id,
      user_id,
    });

    // If nothing was deleted, return not found
    if (deleted_cart?.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found or already deleted",
      });
    }

    // Find the user by user_id
    const user = await userModel.findById(user_id);

    // If user not found, return error
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Get the user's shopping_cart array (if undefined, use empty array)
    const cart_items = user.shopping_cart || [];

    // Create a new array without the deleted cart_id
    const updated_cart_items = cart_items.filter(
      (item) => String(item) !== String(cart?._id)
    );

    // Update the user's shopping_cart with the new array
    await userModel.findByIdAndUpdate(user_id, {
      shopping_cart: updated_cart_items,
    });

    // Return success response
    res
      .status(200)
      .json({ success: true, message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Delete Cart Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
/*  delete_cart */

/*  reset_cart */
export const reset_cart = async (req, res) => {
  try {
    const deletedMany = await cart_product_model.deleteMany({
      user_id: req.user_id,
    });
    if (!deletedMany.acknowledged) {
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
    await userModel.findByIdAndUpdate(req.user_id, {
      shopping_cart: [],
    });

    res
      .status(200)
      .json({ success: true, message: "Cart item deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
/*  reset_cart */
