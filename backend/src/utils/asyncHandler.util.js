export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.path}`,
      error,
    );
    next(error);
  });
};
