"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
function notFound(_req, res) {
    res.status(404).json({ error: "Not Found" });
}
function errorHandler(err, _req, res, _next) {
    const status = err.status || 500;
    const payload = { error: err.message || "Internal Server Error" };
    if (process.env.NODE_ENV !== "production" && err.stack)
        payload.stack = err.stack;
    res.status(status).json(payload);
}
//# sourceMappingURL=error.js.map