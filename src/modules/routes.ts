import { giftRoutes } from "./giftCard/gift.routes.js";
import { Router } from "express";

const router = Router();
router.use("/api", giftRoutes);

export {router};