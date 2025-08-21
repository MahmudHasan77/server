import mongo from "mongoose";

const orderSchema = new mongo.Schema(
  {
    user: {
      type: mongo.Schema.Types.ObjectId,
      ref: "user",
    },
    product:[ {
      type: mongo.Schema.Types.ObjectId,
      ref: "product", 
    }],
    delivery_address: {
      type: mongo.Schema.Types.ObjectId,
      ref: "address",
    },

    payment_id: {
      type: String,
      default: "",
    },
    payment_status: {
      type: String,
      default: "",
    },
    order_status: {
      type: String,
      default: "Pending",
    },
    sub_total_amount: {
      type: Number,
      default: 0,
    },
    total_amount: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const orderModel = mongo.model("order", orderSchema);
export default orderModel;
