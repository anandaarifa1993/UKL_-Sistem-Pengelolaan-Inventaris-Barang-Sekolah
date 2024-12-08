import express from "express"
import { createBarang,updatedBarang,getAllBarang,getBarangSingle,deleteBarang, analisis, borrowAnalysis, } from "../controllers/barangController"
// import { verifyAuthentication,verifyEditUser  } from "../middlewares/userValidation"
import { verifyRole,verifyToken } from "../middlewares/autorization"

const app = express()
app.use(express.json())


app.post('/', [verifyToken,verifyRole(["PENGELOLA"])],createBarang);
app.get('/', getAllBarang);
app.get('/:id',getBarangSingle)
// app.put('/:id',[verifyToken,verifyRole(["PENGELOLA"]),updatedBarang);
app.put(`/:id`,[verifyToken,verifyRole(["PENGELOLA"])],updatedBarang)
app.delete('/:id',[verifyToken,verifyRole(["PENGELOLA"])], deleteBarang);
app.post('/report',analisis);
app.post('/analisis',borrowAnalysis);

// app.post('/',createBarang);
// // app.get('/', getAllBarang);
// app.get('/:id',getBarangSingle)
// // app.put('/:id',[verifyToken,verifyRole(["PENGELOLA"]),updatedBarang);
// app.put(`/:id`,updatedBarang)
// app.delete('/:id', deleteBarang);

export default app