
// backend/utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error('Async Handler Error:', err);
    res.status(500).json({ message: err.message || 'An internal server error occurred.' });
  });
};

module.exports = asyncHandler;
