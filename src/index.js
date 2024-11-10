import dotenv from "dotenv";
import connectionDB from "./db/connection.js";

dotenv.config({
  path: "./env",
});

connectionDB();

// import express from "express";
// const port = process.env.PORT || 8000;
// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("ERROR", (error) => {
//       console.log("Error Connection to Database:", error);
//       throw error;
//     });
//     app.listen(port, () => {
//       console.log(`Server is running on port: ${port}`);
//     });
//   } catch (error) {
//     console.log("Connection Failed:", error);
//     throw error;
//   }
// })();
