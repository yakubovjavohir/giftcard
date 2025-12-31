import { internalServiceKeyMiddleware } from "../../middlewares/internal-key.middleware.js";
import { giftController } from "./gift.controller.js";
import { Router } from "express";

const giftRoutes = Router();
giftRoutes.post("/admin/cards", giftController.createGiftCard.bind(giftController));
giftRoutes.get("/cards/read/:code", giftController.readGiftCard.bind(giftController));
giftRoutes.get("/cards/:code/balance", giftController.checkGiftCardBalance.bind(giftController));
giftRoutes.post("/cards/split", internalServiceKeyMiddleware, giftController.splitCard.bind(giftController));
giftRoutes.post("/cards/spend", internalServiceKeyMiddleware, giftController.spendCard.bind(giftController));
giftRoutes.post("/cards/refund", internalServiceKeyMiddleware, giftController.refundCard.bind(giftController));
export {giftRoutes}