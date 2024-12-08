import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client"
import { BASE_URL } from "../global";
import fs from "fs"
import { add, format, parse } from "date-fns";
// const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient({ errorFormat: "pretty" })

// export const pinjamBarang = async (request: Request, response: Response) => {
//     try {
//       const { idUser, idBarang } = request.body;
  
//       // Cek apakah barang ada dan stoknya cukup
//       const { search } = request.query;
//       const findBarang = await prisma.barang.findFirst({
//         where: { id: Number(idBarang) },
//       });
  
//       if (!findBarang) {
//         return response.status(404).json({
//           status: false,
//           message: `Barang with id: ${idBarang} not found`,
//         });
//       }
  
//       if (findBarang.quantity <= 0) {
//         return response.status(400).json({
//           status: false,
//           message: `Barang with id: ${idBarang} is out of stock`,
//         });
//       }
  
//       // Kurangi stok barang
//       await prisma.barang.update({
//         where: { id: Number(idBarang) },
//         data: { quantity: findBarang.quantity - 1 },
//       });
  
//       // Hitung tanggal pengembalian otomatis (1 minggu setelah peminjaman)
//       const borrowDate = new Date();
//       const returnDate = add(borrowDate, { weeks: 1 });
  
//       // Buat transaksi peminjaman
//       const newPinjam = await prisma.pinjam.create({
//         data: {
//           idUser: Number(idUser),
//           idBarang: Number(idBarang),
//           borrow_date: borrowDate,
//           return_date: returnDate,
//         },
//       });
  
//       return response.status(201).json({
//         status: true,
//         data: newPinjam,
//         message: "Peminjaman berhasil",
//       });
//     } catch (error) {
//       return response.status(400).json({
//         status: false,
//         message: `Error occurred: ${error}`,
//       });
//     }
//   };

// function add(borrowDate: Date, arg1: { weeks: number; }) {
//     throw new Error("Function not implemented.");
// }


// export const pinjamBarang = async (request: Request, response: Response) => {
//     try {
//         const { idUser, idBarang, borrow_date, return_date } = request.body;

//         // Validasi input
//         if (!idUser || !idBarang || !borrow_date || !return_date) {
//             return response.status(400).json({
//                 status: false,
//                 message: "idUser, idBarang, borrow_date, and return_date are required.",
//             });
//         }

//         // Cek apakah barang ada dan stoknya cukup
//         const findBarang = await prisma.barang.findFirst({
//             where: { id: Number(idBarang) },
//         });

//         if (!findBarang) {
//             return response.status(404).json({
//                 status: false,
//                 message: `Barang with id: ${idBarang} not found`,
//             });
//         }

//         if (findBarang.quantity <= 0) {
//             return response.status(400).json({
//                 status: false,
//                 message: `Barang with id: ${idBarang} is out of stock`,
//             });
//         }

//         // Validasi tanggal
//         const parsedBorrowDate = new Date(borrow_date);
//         const parsedReturnDate = new Date(return_date);

//         if (isNaN(parsedBorrowDate.getTime()) || isNaN(parsedReturnDate.getTime())) {
//             return response.status(400).json({
//                 status: false,
//                 message: "Invalid borrow_date or return_date format.",
//             });
//         }

//         if (parsedBorrowDate >= parsedReturnDate) {
//             return response.status(400).json({
//                 status: false,
//                 message: "borrow_date must be earlier than return_date.",
//             });
//         }

//         // Kurangi stok barang
//         await prisma.barang.update({
//             where: { id: Number(idBarang) },
//             data: { quantity: findBarang.quantity - 1 },
//         });

//         // Buat transaksi peminjaman
//         const newPinjam = await prisma.pinjam.create({
//             data: {
//                 idUser: Number(idUser),
//                 idBarang: Number(idBarang),
//                 borrow_date: format(parsedBorrowDate, "dd-MM-yy"),
//         return_date: format(parsedReturnDate, "dd-MM-yy"),
//             },
//         });

//         return response.status(201).json({
//             status: true,
//             data: newPinjam,
//             message: "Peminjaman berhasil",
//         });
//     } catch (error) {
//         return response.status(400).json({
//             status: false,
//             message: `Error occurred: ${error}`,
//         });
//     }
// };


export const pinjamBarang = async (request: Request, response: Response) => {
    try {
        const { idUser, idBarang, borrow_date, return_date } = request.body;

        // Validasi input
        if (!idUser || !idBarang || !borrow_date || !return_date) {
            return response.status(400).json({
                status: false,
                message: "idUser, idBarang, borrow_date, and return_date are required.",
            });
        }

        // Parsing dan validasi tanggal
        const parsedBorrowDate = parse(borrow_date, "dd-MM-yy", new Date());
        const parsedReturnDate = parse(return_date, "dd-MM-yy", new Date());

        if (isNaN(parsedBorrowDate.getTime()) || isNaN(parsedReturnDate.getTime())) {
            return response.status(400).json({
                status: false,
                message: "Invalid borrow_date or return_date format. Use 'dd-MM-yy'.",
            });
        }

        if (parsedBorrowDate >= parsedReturnDate) {
            return response.status(400).json({
                status: false,
                message: "borrow_date must be earlier than return_date.",
            });
        }

        // Cek apakah barang ada dan stoknya cukup
        const findBarang = await prisma.barang.findFirst({
            where: { id: Number(idBarang) },
        });

        if (!findBarang) {
            return response.status(404).json({
                status: false,
                message: `Barang with id: ${idBarang} not found`,
            });
        }

        if (findBarang.quantity <= 0) {
            return response.status(400).json({
                status: false,
                message: `Barang with id: ${idBarang} is out of stock`,
            });
        }

        // Kurangi stok barang
        await prisma.barang.update({
            where: { id: Number(idBarang) },
            data: { quantity: findBarang.quantity - 1 },
        });

        // Buat transaksi peminjaman
        const newPinjam = await prisma.pinjam.create({
            data: {
                idUser: Number(idUser),
                idBarang: Number(idBarang),
                borrow_date: parsedBorrowDate,
                return_date: parsedReturnDate,
            },
        });

        // Format tanggal untuk respons
        return response.status(201).json({
            status: true,
            data: {
                ...newPinjam,
                borrow_date: format(parsedBorrowDate, "dd-MM-yy"),
                return_date: format(parsedReturnDate, "dd-MM-yy"),
            },
            message: "Peminjaman berhasil",
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `Error occurred: ${error}`,
        });
    }
};
