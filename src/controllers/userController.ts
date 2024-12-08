import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client"
import { BASE_URL, SECRET } from "../global";
import fs from "fs"
import md5 from "md5";
import jwt, { sign } from "jsonwebtoken";
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const createUser = async (request: Request, response: Response) => {
    try {
      const { username, email, password,role } = request.body;
      const uuid = uuidv4();
  
      // Check if the email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return response.status(400).json({
          status: false,
          message: "Email sudah terdaftar.",
        });
      }
  
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          uuid,
          username: username || "", // Default to empty string if name is not provided
          email,
          password: md5(password), // No hashing is applied here
          role: role 
        },
      });
  
      return response
        .json({
          status: true,
          data: newUser,
          message: "User baru telah dibuat.",
        })
        .status(200);
    } catch (error) {
      return response.status(400).json({
        status: false,
        message: `Ada error: ${error}`,
      });
    }
  };

//   export const updateUser = async (request: Request, response: Response) => {
//     try {
//         const { id } = request.params
//         const { username, email,password } = request.body
//         const findUser = await prisma.user.findFirst({ where: { id: Number(id) } })
//         if (!findUser) return response
//             .status(200)
//             .json({ status: false, message: 'User is not found' })
  
//         const updatedUser = await prisma.user.update({
//             data: {
//                 username: username || findUser.username,
//                 email:email || findUser.email,
//                 password : password || findUser.password
//             },
//             where: { id: Number(id) }
//         })
  
//         return response.json({
//             status: true,
//             data: updatedUser,
//             message: 'New User Has Updated'
//         }).status(200)
//     } catch (error) {
//         return response
//             .json({
//                 status: false,
//                 message: `There is an error. ${error}`
//             })
//             .status(400)
//     }
//   }


export const updateUser = async (request: Request, response: Response) => {
    try {
        // Ambil dan konversi ID dari params
        const userId = Number(request.params.id);
        if (isNaN(userId)) {
            return response.status(400).json({
                status: false,
                message: 'Invalid user ID format',
            });
        }

        // Ambil data dari body
        const { username, email, password } = request.body;

        // Cari user berdasarkan ID
        const findUser = await prisma.user.findFirst({
            where: { id: userId },
        });

        if (!findUser) {
            return response.status(404).json({
                status: false,
                message: 'User is not found',
            });
        }

        // Update data user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                username: username || findUser.username,
                email: email || findUser.email,
                password: password ? md5(password) : findUser.password,
            },
        });

        return response.status(200).json({
            status: true,
            data: updatedUser,
            message: 'User has been updated successfully',
        });
    } catch (error) {
        return response
            .json({
                status: false,
                message: 'There is an error. ${error}'
            })
            .status(400)
    }
  }


  export const getAllUser = async (request: Request, response: Response) => {
    try {
        //input
        const { search } = request.query
        //main
        const allUser = await prisma.user.findMany({
            where: { username: { contains: search?.toString() || "" } }
        })
        //output
        return response.json({
            status: true,
            data: allUser,
            message: 'user has retrieved'
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: 'There is an error. ${error}'
            })
            .status(400)
    }
  }
  
//   export const deleteUser = async (request: Request, response: Response) => {
//     try {
//         const { id } = request.params
//         const findUser = await prisma.user.findFirst({ where: { id: Number(id) } })
//         if (!findUser) return response
//             .status(200).json({ status: false, massage: `Id: ${id} is not found` })
  
//         const result = await prisma.user.delete({
//             where: { id: Number(request.params.id) }
//         })
//         return response.json({
//             status: true,
//             data: result,
//             massage: "User has been Deleted"
//         }).status(200)
  
//     } catch (error) {
//         return response.json({
//             status: false,
//             massage: `There is an error. ${error}`
//         })
//     }
//   }

export const deleteUser = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        // Konversi ID ke tipe number
        const userId = Number(id);
        if (isNaN(userId)) {
            return response.status(400).json({
                status: false,
                message: 'Invalid ID format',
            });
        }

        // Periksa apakah user dengan ID tersebut ada
        const findUser = await prisma.user.findFirst({
            where: { id: userId },
        });

        if (!findUser) {
            return response.status(404).json({
                status: false,
                message: `User with ID: ${id} is not found`,
            });
        }

        // Hapus user dari database
        const result = await prisma.user.delete({
            where: { id: userId },
        });

        return response.status(200).json({
            status: true,
            data: result,
            message: "User has been deleted successfully",
        });
    } catch (error) {
        return response.json({
            status: false,
            massage: `There is an error. ${error}`
        })
    }
  }



//   export const authentication = async (request: Request, response: Response) => {
//     try {
//       const { email, password } = request.body;
//       const findUser = await prisma.user.findFirst({
//         where: { email, password: md5(password) },
//       });
  
//       if (!findUser)
//         return response.status(200).json({
//           status: false,
//           logged: false,
//           message: `Email or Password invalid`,
//         });
  
//       let data = {
//         id: findUser.id,
//         name: findUser.username,
//         email: findUser.email,
//         role: findUser.role,
//       };
  
//       let payload = JSON.stringify(data);
  
//       let token = sign(payload, SECRET || "token");
  
//       return response
//       .status(200)
//       .json({ status: true, logged: true, message: "Login Succses", token    })
//     } 
//       catch (error) {
//           return response.json({
//             status: false,
//             message: `Ada error: ${error}`,
//           }).status(400)
//         }
//   };

// function sign(payload: string, arg1: any) {
//     throw new Error("Function not implemented.");
// }

// export const authentication = async (request: Request, response: Response) => {
//     try {
//         const { email, password } = request.body;

//         // Cari pengguna berdasarkan email dan password
//         const findUser = await prisma.user.findFirst({
//             where: { email, password: md5(password) },
//         });

//         if (!findUser) {
//             return response.status(200).json({
//                 status: false,
//                 logged: false,
//                 message: `Email or Password invalid`,
//             });
//         }

//         // Data yang akan disimpan dalam token
//         const data = {
//             id: findUser.id,
//             name: findUser.username,
//             email: findUser.email,
//             role: findUser.role,
//         };

//         // Buat token JWT
//         let payload = JSON.stringify(data);
  
//               let token = sign(payload, SECRET || "token");

//         // Berikan respon
//         return response.status(200).json({
//             status: true,
//             logged: true,
//             message: "Login Success",
//             token,
//         });
//     }    catch (error) {
//         return response.json({
//             status: false,
//             massage: `There is an error. ${error}`
//         })
//     }
  
// };

export const authentication = async (request: Request, response: Response) => {
    try {
        const { email, password } = request.body;

        // Cari pengguna berdasarkan email
        const findUser = await prisma.user.findFirst({
            where: { email },
        });

        if (!findUser) {
            return response.status(401).json({
                status: false,
                logged: false,
                message: 'Email or Password invalid',
            });
        }

        // Validasi password
        if (findUser.password !== md5( password))  {
            return response.status(401).json({
                status: false,
                logged: false,
                message: 'Email or Password invalid',
            });
        }

        // Data yang akan disimpan dalam token
        const data = {
            id: findUser.id,
            name: findUser.username,
            email: findUser.email,
            role: findUser.role,
        };

        // Buat token JWT
        const token = jwt.sign(data, SECRET || "token") ;

        // Berikan respon
        return response.status(200).json({
            status: true,
            logged: true,
            message: "Login Success",
            token,
        });
    }    catch (error) {
        return response.json({
            status: false,
            massage: `There is an error. ${error}`
        })
    }
  
};
