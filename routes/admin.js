const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const usersFile = path.join(__dirname, "../data/users.json");

// Dummy admin credentials
const ADMIN_USERNAME = "reflexo";
const ADMIN_PASSWORD = "1";

const loadUsers = () => {
    if (!fs.existsSync(usersFile)) return [];
    return JSON.parse(fs.readFileSync(usersFile, "utf8") || "[]");
};

const saveUsers = (users) => {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};


const requireAuth = (req, res, next) => {
    if (!req.session.admin) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    next();
};


router.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.admin = true;
        return res.json({ message: "Login successful!" });
    }
    res.status(401).json({ message: "Invalid credentials!" });
});


router.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "Logged out successfully!" });
});


router.use(requireAuth);


router.get("/users", (req, res) => {
    res.json(loadUsers());
});


router.post("/add", (req, res) => {
    const { hwid, days } = req.body;
    if (!hwid || !days) return res.json({ message: "HWID and days required!" });

    let users = loadUsers();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    let userIndex = users.findIndex((user) => user.hwid === hwid);
    if (userIndex !== -1) {
        users[userIndex].expiry = expiryDate;
        users[userIndex].banned = false;
    } else {
        users.push({ hwid, expiry: expiryDate, banned: false });
    }

    saveUsers(users);
    res.json({ message: "User added/updated successfully!" });
});


router.post("/ban", (req, res) => {
    const { hwid } = req.body;
    if (!hwid) return res.json({ message: "HWID is required!" });

    let users = loadUsers();
    let userIndex = users.findIndex((user) => user.hwid === hwid);

    if (userIndex === -1) return res.json({ message: "User not found!" });

    users[userIndex].banned = true;
    saveUsers(users);
    res.json({ message: "User banned successfully!" });
});

router.post("/unban", (req, res) => {
    const { hwid } = req.body;
    if (!hwid) return res.json({ message: "HWID is required!" });

    let users = loadUsers();
    let userIndex = users.findIndex((user) => user.hwid === hwid);

    if (userIndex === -1) return res.json({ message: "User not found!" });

    users[userIndex].banned = false;
    saveUsers(users);
    res.json({ message: "User unbanned successfully!" });
});

module.exports = router;
