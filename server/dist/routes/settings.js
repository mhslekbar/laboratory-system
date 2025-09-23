"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GeneralSettingsController_1 = require("../controllers/GeneralSettingsController");
const authorizedPermission_1 = require("../middlewares/authorizedPermission");
const SettingsRoute = (0, express_1.Router)();
// GENERAL (schéma dédié)
// authorizedPermission(["AFFICHER"], "PARAMETRES"), 
SettingsRoute.get("/general", (0, authorizedPermission_1.authorizedPermission)(["AFFICHER"], "PARAMETRES"), GeneralSettingsController_1.getGeneralSettings);
SettingsRoute.put("/general", (0, authorizedPermission_1.authorizedPermission)(["MODIFIER"], "PARAMETRES"), GeneralSettingsController_1.putGeneralSettings);
exports.default = SettingsRoute;
