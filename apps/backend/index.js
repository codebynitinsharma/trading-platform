require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);
