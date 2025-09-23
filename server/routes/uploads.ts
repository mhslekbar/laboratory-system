import { Router } from "express";
import { uploadImage } from "../controllers/uploadsController";
import { uploadOneImage } from "../middlewares/multerUploads";

const uploadsRoute = Router();

// POST /api/uploads/image?folder=logos
uploadsRoute.post("/image", uploadOneImage, uploadImage);

export default uploadsRoute;
