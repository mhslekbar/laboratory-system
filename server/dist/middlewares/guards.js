"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireDoctor = void 0;
const requireDoctor = (req, res, next) => {
    const isDoctor = !!req?.user?.doctor?.isDoctor;
    if (!isDoctor)
        return res.status(403).json(["Accès réservé au médecin"]);
    next();
};
exports.requireDoctor = requireDoctor;
//# sourceMappingURL=guards.js.map