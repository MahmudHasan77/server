import userModel from "../models/user_model.js";
import AddressModel from "./../models/user_address_model.js";

/**  add_address_controller */
export const add_address_controller = async (req, res) => {
  const user_id = req.user_id;
  const { address_line, country, city, state, PINcode, mobile, status } =
    req.body;
  try {
    const add_address = new AddressModel({
      user_id,
      address_line,
      country,
      city,
      state,
      PINcode,
      mobile,
      status,
    });
    const save_address = await add_address.save();
    const save_to_user_address = await userModel.updateOne(
      { _id: user_id },
      { $addToSet: { address_details: save_address?._id } }
    );

    if (save_address && save_to_user_address) {
      res.status(201).json({
        success: true,
        message: "address added successfully",
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: "something wrong try again" });
    }
  } catch (error) {
    console.log(error);
  }
};
/**  add_address_controller */

/**  get_all_address */
export const get_all_address = async (req, res) => {
  const id = req.user_id;
  try {
    const addresses = await AddressModel.find({ user_id: id });
    if (!addresses) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }
    res.status(201).json({ success: true, addresses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "something wrong" });
  }
};
/**  get_all_address */

/**  select_address */
export const select_address = async (req, res) => {
  const user_id = req.user_id;
  const address_id = req.params.address_id;
  try {
    const false_active = await AddressModel.updateMany(
      { user_id },
      {
        status: false,
      }
    );

    if (!false_active) {
      res.status(500).json({ success: false, message: "something wrong" });
    }

    const true_active = await AddressModel.findByIdAndUpdate(address_id, {
      status: true,
    });
    if (!true_active) {
      res.status(500).json({ success: false, message: "something wrong" });
    }
    res
      .status(201)
      .json({ success: true, message: "Address Added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "something wrong" });
  }
};
/**  select_address */

/**  delete_address */
export const delete_address = async (req, res) => {
  const address_id = req.params.id;
  const user_id = req.user_id;
  try {
    const delete_address = await AddressModel.findByIdAndDelete(address_id);
    if (!delete_address) {
      return res
        .status(500)
        .json({ success: false, message: "something went wrong try again" });
    }
    const user = await userModel.findById(user_id);
    if (!user) {
      return res
        .status(500)
        .json({ success: false, message: "user not found" });
    }
    const addresses = user?.address_details || [];
    const deleted_address = addresses?.filter(
      (addr) => String(addr._id) !== String(address_id)
    );
    const delete_address_from_user = await userModel.findByIdAndUpdate(
      user_id,
      { address_details: deleted_address }
    );
    if (!delete_address_from_user) {
      return res
        .status(500)
        .json({ success: false, message: "something went wrong try again" });
    }

    res
      .status(201)
      .json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong" });
  }
};
/**  delete_address */
