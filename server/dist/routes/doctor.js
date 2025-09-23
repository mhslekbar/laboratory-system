"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/routes/doctor.ts
const express_1 = require("express");
const guards_1 = require("../middlewares/guards");
const CaseController_1 = require("../controllers/CaseController");
const router = (0, express_1.Router)();
// GET /api/doctor/cases?q=&status=&page=&limit=
// Forces doctorId to the connected user, reusing your listCases controller
router.get("/cases", guards_1.requireDoctor, (req, res) => {
    req.query = {
        ...req.query,
        doctorId: String(req.user?._id),
    };
    return (0, CaseController_1.listCases)(req, res);
});
// POST /api/doctor/cases/:id/approve
router.post("/cases/:id/approve", guards_1.requireDoctor, (req, res) => {
    // Ensure "by" is always the current user (doctor)
    req.body = {
        approved: true,
        by: req.user?._id,
    };
    return (0, CaseController_1.approveCase)(req, res);
});
exports.default = router;
