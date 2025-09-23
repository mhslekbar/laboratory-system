// server/routes/doctor.ts
import { Router } from "express";
import { verifyToken, AuthRequest } from "../middlewares/verifyToken";
import { requireDoctor } from "../middlewares/guards";
import { listCases, approveCase } from "../controllers/CaseController";

const router = Router();

// GET /api/doctor/cases?q=&status=&page=&limit=
// Forces doctorId to the connected user, reusing your listCases controller
router.get("/cases", requireDoctor, (req, res) => {
  (req as AuthRequest).query = {
    ...req.query,
    doctorId: String((req as AuthRequest).user?._id),
  };
  return listCases(req, res);
});

// POST /api/doctor/cases/:id/approve
router.post("/cases/:id/approve", requireDoctor, (req, res) => {
  // Ensure "by" is always the current user (doctor)
  (req as AuthRequest).body = {
    approved: true,
    by: (req as AuthRequest).user?._id,
  };
  return approveCase(req, res);
});

export default router;
