import dotenv from "dotenv";
import connectionDB from "./db/connection.js";
import { app } from "./app.js";

const port = process.env.PORT || 8000;

dotenv.config({
  path: "./env",
});

connectionDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`\n Server is running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.log("MONGODB connection failed!!", err);
  });

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
