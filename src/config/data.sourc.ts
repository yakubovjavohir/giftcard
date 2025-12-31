import "reflect-metadata"
import { DataSource } from "typeorm"
import { GiftCard } from "../modules/giftCard/entity/card.entities.js"
import { GiftCardTransaction } from "../modules/giftCard/entity/transaction.entities.js"
import dotenv from "dotenv"

dotenv.config()

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST as unknown as string,
    port: process.env.DB_PORT as unknown as number,
    username: process.env.DB_USERNAME as unknown as string,
    password: process.env.DB_PASSWORD as unknown as string,
    database: process.env.DB_NAME as unknown as string,
    synchronize: true,
    logging: false,
    entities: [GiftCard, GiftCardTransaction],
})
