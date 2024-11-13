import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const errorHandler = async (err, req, res, next) => {
  console.error(err); // Log the error for debugging

  // If headers have already been sent, delegate to the default error handler
  if (res.headersSent) {
    return next(err);
  }

  // Set default status to 500 (Internal Server Error)
  res.status(500);
  const isProduction = process.env.NODE_ENV === "production";

  // Determine the error message based on the environment
  const errorMessage = isProduction
    ? "An unexpected error occurred."
    : err.message;

  // Handle PrismaClientKnownRequestError
  if (err.name === "PrismaClientKnownRequestError") {
    switch (err.code) {
      // Bad request (400)
      case "P2000": // Value too long for column type
      case "P2003": // Foreign key constraint failed
      case "P2004": // Constraint failed on database
      case "P2005": // Invalid value for field type
      case "P2006": // Invalid value for field
      case "P2007": // Data validation error
      case "P2008": // Query parsing error
      case "P2009": // Query validation error
      case "P2010": // Raw query failed
      case "P2011": // Null constraint violation
      case "P2012": // Missing required value
      case "P2013": // Missing required argument
      case "P2014": // Relation violation
      case "P2016": // Query interpretation error
      case "P2017": // Disconnected relation
      case "P2019": // Input error
      case "P2020": // Value out of range
      case "P2023": // Inconsistent column data
      case "P2026": // Unsupported feature by the provider
        err.status = 400;
        break;

      // Not found (404)
      case "P2001": // Record not found
      case "P2015": // Related record not found
      case "P2018": // Connected records not found
      case "P2021": // Table not found
      case "P2022": // Column not found
      case "P2025": // Missing required records
        err.status = 404;
        break;

      // Conflict (409)
      case "P2002": // Unique constraint failed
        err.status = 409;
        break;

      // Default to internal server error (500)
      default:
        err.status = 500;
    }
  }

  // Handle PrismaClientValidationError
  if (err.name === "PrismaClientValidationError") {
    err.status = 400;
  }

  // Handle other known errors (e.g., validation errors from Express Validator)
  if (err.errors && Array.isArray(err.errors)) {
    err.status = 400;
    const validationErrors = err.errors.map((e) => e.msg).join(", ");
    return res.status(400).json({
      status: 400,
      message: validationErrors,
      code: "VALIDATION_ERROR",
      details: err.errors,
    });
  }

  // Disconnect Prisma Client if a Prisma error occurred
  if (err.name && err.name.startsWith("Prisma")) {
    await prisma.$disconnect();
  }

  // Send a structured JSON error response
  //res.status(err.status).json({
  //status: err.status,
  //message: errorMessage,
  //code: err.code || "INTERNAL_ERROR",
  //details: !isProduction ? err.meta || err.stack : null,
  //});
};

export default errorHandler;
