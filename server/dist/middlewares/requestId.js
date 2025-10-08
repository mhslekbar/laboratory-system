"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganLogger = void 0;
exports.requestId = requestId;
const crypto_1 = require("crypto");
const morgan_1 = __importDefault(require("morgan"));
function requestId(req, _res, next) {
    req.requestId = (0, crypto_1.randomUUID)();
    next();
}
morgan_1.default.token("id", (req) => req.requestId || "-");
exports.morganLogger = (0, morgan_1.default)(':id :method :url :status :res[content-length] - :response-time ms');
//# sourceMappingURL=requestId.js.map