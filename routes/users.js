const express = require("express");
const store = require("../db/store");

const router = express.Router();

// GET /users — list every user
router.get("/", (req, res) => {
  res.json(store.getAllUsers());
});

// GET /users/:id — fetch a single user, or 404 if it doesn't exist
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = store.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

// POST /users — create a user; name and email are required
router.post("/", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = store.createUser({ name, email });
  res.status(201).json(user);
});

// Checks that name and email are non-blank strings and that email contains
// an "@". Returns an error message, or null when the input is valid.
function validateUserInput(body) {
  const { name, email } = body ?? {};

  if (typeof name !== "string" || name.trim() === "") {
    return "name is required and must be a non-empty string";
  }
  if (typeof email !== "string" || email.trim() === "") {
    return "email is required and must be a non-empty string";
  }
  if (!email.includes("@")) {
    return "email must be a valid email address";
  }

  return null;
}

// PUT /users/:id — replace a user's name and email; 400 on invalid input,
// 404 if the user doesn't exist
router.put("/:id", (req, res) => {
  const error = validateUserInput(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const id = Number(req.params.id);
  const { name, email } = req.body;
  const user = store.updateUser(id, { name, email });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
