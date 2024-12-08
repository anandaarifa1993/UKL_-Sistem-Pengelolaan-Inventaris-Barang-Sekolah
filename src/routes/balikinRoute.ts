import express from "express"
import { balikinBarang} from "../controllers/balikinController"
// import { verifyAuthentication,verifyEditUser  } from "../middlewares/userValidation"
import { verifyRole,verifyToken } from "../middlewares/autorization"
import { errorHandler } from "../middlewares/errorHandling"

const app = express()
app.use(express.json())


app.post("/balikkan", balikinBarang);

export default app