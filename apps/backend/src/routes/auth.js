const express = require("express");
const {
  registerSchema,
  loginSchema,
} = require("../validators/auth");

const router = express.Router();

// Register route
const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");

// Register route (REAL)
router.post("/auth/register", async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: result.error.errors,
    });
  }

  const { email, password } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.json({
      message: "User registered",
      email: user.email,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// Login route
const jwt = require("jsonwebtoken");

router.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  // dummy validation (for now)
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    message: "User logged in",
    token
  });
});


module.exports = router;
