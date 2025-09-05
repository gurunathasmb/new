// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// Schema
const resultSchema = new mongoose.Schema({
  name1: String,
  name2: String,
  percentage: Number,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Result = mongoose.model("Result", resultSchema);

// ---------- API Routes ----------

// Save result
app.post("/api/save", async (req, res) => {
  try {
    const { name1, name2, percentage, message } = req.body;
    if (!name1 || !name2) {
      return res.status(400).json({ success: false, error: "Names are required" });
    }
    const newResult = new Result({ name1, name2, percentage, message });
    await newResult.save();
    res.json({ success: true, data: newResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin results (protected with secret key)
app.get("/api/results", async (req, res) => {
  try {
    const adminKey = req.query.key;
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    const results = await Result.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------- Serve Frontend ----------

// Serve static files (index.html, admin.html, css, js)
app.use(express.static(path.join(__dirname, "public")));

// Route for /admin → serves admin.html
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Catch-all fallback (Express v5 safe)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
