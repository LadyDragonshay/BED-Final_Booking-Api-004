import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  // Extract the token from the `Authorization` header (Bearer token)
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token and extract user information
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data (id, username, roles) to the request object
    next();
  } catch (error) {
    // Provide a more specific error message
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token has expired. Please log in again." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token. Access denied." });
    }

    // Handle any other unexpected errors
    return res
      .status(500)
      .json({ message: "An error occurred during authentication." });
  }
};

export default auth;
