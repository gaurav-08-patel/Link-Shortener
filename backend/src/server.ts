import express from "express";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", require("./routes/auth.route"));

app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
