const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables from .env file
dotenv.config();

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

// Connect to MongoDB
connectDB();

const app = express();

// Allow frontend app to call API during local development
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
]);

if (process.env.CLIENT_URL) {
  allowedOrigins.add(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (Postman/cURL) and configured browser origins.
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);

// Middleware: Parse incoming JSON request bodies
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/bills", require("./routes/billRoutes"));
app.use("/api/drafts", require("./routes/draftRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Billdex API is running 🚀" });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Billdex server running on port ${PORT}`);
});
