import database from "./config/mongoDB.js";
import app from "./app.js";
import connectCloudinary from "./config/cloudinary.js";

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await database(); 
    await connectCloudinary(); 

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
})();
