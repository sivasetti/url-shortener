function errorHandler(err, req, res, next) {
    console.error(`Unhandled error:`, err.message);
    res.status(500).json({error: `Internal Server Error`});
}


module.exports = errorHandler;