"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadsController_1 = require("../controllers/uploadsController");
const multerUploads_1 = require("../middlewares/multerUploads");
const uploadsRoute = (0, express_1.Router)();
// POST /api/uploads/image?folder=logos
uploadsRoute.post("/image", multerUploads_1.uploadOneImage, uploadsController_1.uploadImage);
exports.default = uploadsRoute;
//# sourceMappingURL=uploads.js.map