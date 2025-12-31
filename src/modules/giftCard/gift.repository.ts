import { AppDataSource } from "../../config/data.sourc.js"
import { GiftCard } from "./entity/card.entities.js"

export const giftRepository = AppDataSource.getRepository(GiftCard)
