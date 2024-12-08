import express from "express"
import { createUser, updateUser, getAllUser, deleteUser, authentication } from "../controllers/userController"
import { verifyAuthentication,verifyEditUser  } from "../middlewares/userValidation"
import { verifyRole,verifyToken } from "../middlewares/autorization"
import { errorHandler } from "../middlewares/errorHandling"

const app = express()
app.use(express.json())
 
app.post('/',createUser);
app.get('/',getAllUser);
app.put('/update/:id',[updateUser, verifyToken, verifyRole(["PENGELOLA", "MURID"])], updateUser);
app.delete('/delete/:id',[verifyToken, verifyRole(["PENGELOLA","MURID"])], deleteUser);
app.post('/login',[verifyAuthentication], authentication);

// app.post('/',createUser);
// app.get('/',getAllUser);
// app.put('/update/:id', updateUser);
// app.delete('/delete/:id', deleteUser);
// app.post('/login', authentication);


export default app