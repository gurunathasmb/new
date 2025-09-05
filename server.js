const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect MongoDB
mongoose.connect("mongodb://localhost:27017/lovecalc", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ Error:", err));

// Schema
const resultSchema = new mongoose.Schema({
  name1: String,
  name2: String,
  percentage: Number,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Result = mongoose.model("Result", resultSchema);

// Save result
app.post("/api/save", async (req, res) => {
  try {
    const { name1, name2, percentage, message } = req.body;
    const newResult = new Result({ name1, name2, percentage, message });
    await newResult.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all results (Admin page)
app.get("/api/results", async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
