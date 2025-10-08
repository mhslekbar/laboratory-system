"use strict";
// server/middlwares/setCacheControl.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCacheControl = void 0;
const setCacheControl = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache');
    next();
};
exports.setCacheControl = setCacheControl;
//# sourceMappingURL=setCacheControl.js.map