import { Router } from "express";
import { checkAdmin } from "../controllers/auth.controller.js";
import {
    resolveReport,
    setUserBanStatus,
} from "../controllers/admin.controller.js";

const adminRouter = Router();

adminRouter.post("/user/ban-user", checkAdmin, setUserBanStatus);

adminRouter.post("/reports/resolve", checkAdmin, resolveReport);

export default adminRouter;
