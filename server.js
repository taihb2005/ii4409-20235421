const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const { cleanString, cleanNumber } = require("./utils/userUtils");

const app = express();

app.use(cors());
app.use(express.json());
mongoose
  .connect("mongodb+srv://20235421:20235421@taikhuongcluster.cuhwu3x.mongodb.net/?appName=taikhuongCluster/it4409")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Error:", err));


app.get("/api/users", async (req, res) => {
  const MAX_LIMIT = 50
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || 5));
    const search = cleanString(req.query.search || "");

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: users
    });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});


app.post("/api/users", async (req, res) => {
  try {
    const userData = {
      name: cleanString(req.body.name),
      age: cleanNumber(req.body.age),
      email: cleanString(req.body.email),
      address: cleanString(req.body.address)
    };

    const newUser = await User.create(userData);

    res.status(201).json({
      message: "Tạo người dùng thành công",
      data: newUser
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



app.put("/api/users/:id", async (req, res) => {
  try {
    const currentUser = await User.findById(
      req.params.id
    )

    if(!currentUser){
      return res.status(404).json({error: "User not found"})
    }

    const updateData = {
      name: cleanString(req.body.name || currentUser.name),
      age: cleanNumber(req.body.age || currentUser.age),
      email: cleanString(req.body.email || currentUser.email),
      address: cleanString(req.body.address || currentUser.address)
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser)
      return res.status(404).json({ error: "Không tìm thấy người dùng" });

    res.json({
      message: "Cập nhật người dùng thành công",
      data: updatedUser
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



app.delete("/api/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser)
      return res.status(404).json({ error: "Không tìm thấy người dùng" });

    res.json({ message: "Xóa người dùng thành công" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



app.listen(3001, () => console.log("App is listening on port 3001"));

