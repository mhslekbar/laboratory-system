import { Router } from "express";
import { getGeneralSettings, putGeneralSettings } from "../controllers/GeneralSettingsController";
import { authorizedPermission } from "../middlewares/authorizedPermission";


const SettingsRoute = Router();

// GENERAL (schéma dédié)
// authorizedPermission(["AFFICHER"], "PARAMETRES"), 
SettingsRoute.get("/general",   authorizedPermission(["AFFICHER"], "PARAMETRES"), getGeneralSettings);
SettingsRoute.put("/general", authorizedPermission(["MODIFIER"], "PARAMETRES"), putGeneralSettings);

export default SettingsRoute;
