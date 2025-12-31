import "reflect-metadata"
import express from 'express'
import { router } from './modules/routes.js'
import { AppDataSource } from "./config/data.sourc.js"

const app = express()
await AppDataSource.initialize()
app.use(express.json())
app.use(router)

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})