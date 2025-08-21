import ram_model from "./../models/ram_model.js";

export const add_ram = async (req, res) => {
  const { ram } = req.body;

  try {
    const trimmed = ram.trim(); 

    const lastTwo = trimmed.slice(-2);
    const numberPart = trimmed.slice(0, -2); 

    if (lastTwo !== "GB") {
      return res.status(400).json({
        success: false,
        message: "Please enter RAM in the correct format (e.g., 8GB)",
      });
    }

    if (!numberPart || isNaN(numberPart)) {
      return res.status(400).json({
        success: false,
        message: "Please enter how much GB (e.g., 8GB)",
      });
    }

    const newRam = new ram_model({
      name: trimmed,
    });

    const saveRam = await newRam.save();
    if (!saveRam) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }

    res.status(201).json({
      success: true,
      message: trimmed + " added successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


export const getRam = async (req, res) => {
  try {
    const rams = await ram_model.find();
    if (!rams) {
      res.status(500).json({ success: false, message: "something wrong" });
    }

    res.status(201).json({
      success: true,
      rams,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "something wrong" });
  }
};

export const deleteRam = async (req, res) => {
  const id = req.params.id;

  try {
    if (!id) {
      res.status(400).json({ success: false, message: "Product not found" });
    }

    const deletedRam = await ram_model.findByIdAndDelete(id);
    if (!deletedRam) {
      res.status(500).json({ success: false, message: "Product not found" });
    }

    res.status(201).json({
      success: true,
      message: "RAM deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "something wrong" });
  }
};
