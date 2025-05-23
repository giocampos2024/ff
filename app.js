const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(
    session({
        secret: "5cd5981e0b8d1cae27f5f8432b4dbfd28bb16638c998203c824f9b1948b8f54d",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Secure should be true in production with HTTPS
    })
);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));

// Serve admin panel
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
