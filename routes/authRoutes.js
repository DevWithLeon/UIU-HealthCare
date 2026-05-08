const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashed
    });

    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(400).json("User not found");

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) return res.status(400).json("Wrong password");

    const token = jwt.sign({ id: user._id }, "secretkey");

    res.json({ token, user });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
