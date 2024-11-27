const errorHandler = (err, req, res, next) => {
      console.error(err.stack); // Log the error stack trace for debugging
    
      const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
      res.status(statusCode);
    
      res.json({
        error: {
          message: err.message || "Internal Server Error",
        },
      });
    };
    
    export default errorHandler;
    