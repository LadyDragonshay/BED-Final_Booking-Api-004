const errorHandler = (err, req, res, next) => {
  // Log the error to the console for debugging
  console.error(err);

  // If response headers have already been sent, delegate the error further.
  if (res.headersSent) {
    return next(err);
  }

  // Default status is 500 (Internal Server Error)
  err.status = err.status || 500;

  // Handling PrismaClientKnownRequestError
  if (err.name === "PrismaClientKnownRequestError") {
    switch (err.code) {
      // Bad request errors (400)
      case "P2000": //"The provided value for the column is too long for the column's type. Column: {column_name}"
      case "P2003": //"Foreign key constraint failed on the field: {field_name}"
      case "P2004": //"A constraint failed on the database: {database_error}"
      case "P2005": //"The value {field_value} stored in the database for the field {field_name} is invalid for the field's type"
      case "P2006": //"The provided value {field_value} for {model_name} field {field_name} is not valid"
      case "P2007": //"Data validation error {database_error}"
      case "P2008": //"Failed to parse the query {query_parsing_error} at {query_position}"
      case "P2009": //"Failed to validate the query: {query_validation_error} at {query_position}"
      case "P2010": //"Raw query failed. Code: {code}. Message: {message}"
      case "P2011": //"Null constraint violation on the {constraint}"
      case "P2012": //"Missing a required value at {path}"
      case "P2013": //"Missing the required argument {argument_name} for field {field_name}"
      case "P2014": //"The change you are trying to make would violate the required relation"
      case "P2016": //"Query interpretation error. {details}"
      case "P2017": //"The records for relation {relation_name} are not connected."
      case "P2019": //"Input error. {details}"
      case "P2020": //"Value out of range for the type. {details}"
      case "P2023": //"Inconsistent column data: {message}"
      case "P2026": //"Database provider does not support a feature used in the query"
        err.status = 400;
        break;

      // Not found errors (404)
      case "P2001": //"The record searched for does not exist"
      case "P2015": //"A related record could not be found"
      case "P2018": //"The required connected records were not found"
      case "P2021": //"The table does not exist in the current database"
      case "P2022": //"The column does not exist in the current database"
      case "P2025": //"An operation failed due to missing required records"
        err.status = 404;
        break;

      // Conflict errors (409)
      case "P2002": //"Unique constraint failed"
        err.status = 409;
        break;

      // Internal server errors (500)
      default:
        err.status = 500;
    }
  }

  // Handling PrismaClientValidationError
  if (err.name === "PrismaClientValidationError") {
    err.status = 400;
  }

  // Send JSON response with error status and message
  res.status(err.status).json({
    message: err.message || "Something went wrong!",
  });

  // Call next to pass the error further if needed
  next();
};

export default errorHandler;
