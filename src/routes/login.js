import login from "../services/auth/login.js";
import { Router } from "express";
import jwt from "jsonwebtoken";
import userData from "../data/users.json" with { type: "json" };

const router = Router();

router.post("/", (req, res) => {
  const secretKey = process.env.AUTH_SECRET_KEY || "my-secret-key"; // my-secret-key is default if AUTH is not provided
  const { username, password } = req.body;
  const { users } = userData;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials!" });
  }

  const token = jwt.sign({ userId: user.id }, secretKey);
  res.status(200).json({ message: "Successfully logged in!", token });
});

export default router;
