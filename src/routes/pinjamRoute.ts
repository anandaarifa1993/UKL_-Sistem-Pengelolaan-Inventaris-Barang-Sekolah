import express from "express"
import { pinjamBarang } from "../controllers/pinjamController"
// import { verifyAuthentication,verifyEditUser  } from "../middlewares/userValidation"
import { verifyRole,verifyToken } from "../middlewares/autorization"
import { errorHandler } from "../middlewares/errorHandling"

const app = express()
app.use(express.json())


app.post("/pinjam", pinjamBarang);

export default app