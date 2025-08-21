import orderModel from "../models/order_model.js";
import product_model from "../models/product_model.js";
import mongoose from "mongoose";

export const create_order = async (req, res) => {
  const user_id = req.user_id;
  const {
    shopping_cart,
    payment_status,
    delivery_address,
    sub_total_amount,
    total_amount,
    quantity,
    products_ids,
  } = req.body;

  try {
    for (const cart of shopping_cart) {
      const product = cart.product_id;

      if (product.count_in_stock < cart.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sorry, product "${product.name}" is out of stock or has only ${product.count_in_stock} left.`,
        });
      }
    }

    for (const cart of shopping_cart) {
      const product = await product_model.findById(cart.product_id._id);
      product.count_in_stock -= cart.quantity;
      await product.save();
    }

    const new_order = new orderModel({
      user: user_id,
      payment_status,
      delivery_address,
      sub_total_amount,
      total_amount,
      quantity,
      product: products_ids,
    });

    const saved_order = await new_order.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: saved_order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error?.message,
    });
  }
};

export const get_orders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.user_id })
      .populate("product")
      .populate("delivery_address");

    if (!orders?.length) {
      res.status(400).json({ success: false, message: "Order not found" });
    }
    res.status(201).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error?.message,
    });
  }
};

export const get_all_order_count = async (req, res) => {
  try {
    const totalOrdersCount = await orderModel.countDocuments();
    if (!totalOrdersCount) {
      return res.status(404).json({
        success: false,
        message: "Orders not found",
      });
    }

    return res.status(200).json({
      success: true,
      totalOrdersCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error?.message,
    });
  }
};

export const get_all_orders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || "";

    let matchQuery = {};

    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        matchQuery = { _id: new mongoose.Types.ObjectId(search) };
      } else {
        matchQuery = { order_status: { $regex: search, $options: "i" } };
      }
    }

    const totalOrdersCount = await orderModel.countDocuments(matchQuery);
    const totalPage = Math.ceil(totalOrdersCount / limit);

    const orders = await orderModel
      .find(matchQuery)
      .skip(skip)
      .limit(limit)
      .populate("product")
      .populate("user")
      .populate("delivery_address");

    if (!orders?.length) {
      return res.status(404).json({
        success: false,
        message: "Orders not found",
      });
    }

    return res.status(200).json({
      success: true,
      orders,
      pagination: { page, totalOrdersCount, totalPage },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error?.message,
    });
  }
};

export const get_ten_orders = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate("product")
      .populate("user")
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("delivery_address");
    if (!orders?.length) {
      res.status(400).json({ success: false, message: "Order not found" });
    }
    res.status(201).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error?.message,
    });
  }
};

export const change_status = async (req, res) => {
  try {
    const updatedStatus = await orderModel.findByIdAndUpdate(req.params.id, {
      order_status: req.body.status,
    });

    if (!updatedStatus) {
      res.status(400).json({ success: false, message: "Order not found" });
    }

    res.status(201).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error?.message,
    });
  }
};




export const getDeliveredSales = async (req, res) => {
  try {
    const result = await orderModel.aggregate([
      {
        $match: {
          order_status: "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$total_amount" },
        },
      },
    ]);

    res.json({
      totalSales: result[0]?.totalSales || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};