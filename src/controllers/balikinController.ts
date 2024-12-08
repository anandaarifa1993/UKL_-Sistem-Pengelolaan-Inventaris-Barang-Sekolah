import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client"
import { BASE_URL } from "../global";
import fs from "fs"
import { format, parse } from "date-fns";
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient({ errorFormat: "pretty" })

// export const balikinBarang = async (request: Request, response: Response) => {
//     try {
//       const { id } = request.params; // ID transaksi peminjaman
  
//       // Cari transaksi peminjaman
//       const { search } = request.query;
//       const findPinjam = await prisma.pinjam.findFirst({
//         where: { id: Number(id) },
//       });
  
//       if (!findPinjam) {
//         return response.status(404).json({
//           status: false,
//           message: `Peminjaman with id: ${id} not found`,
//         });
//       }
  
//       // Tambahkan stok barang kembali
//       const findBarang = await prisma.barang.findFirst({
//         where: { id: findPinjam.idBarang },
//       });
  
//       if (!findBarang) {
//         return response.status(404).json({
//           status: false,
//           message: `Barang with id: ${findPinjam.idBarang} not found`,
//         });
//       }
  
//       await prisma.barang.update({
//         where: { id: findPinjam.idBarang },
//         data: { quantity: findBarang.quantity + 1 },
//       });
  
//       // Hapus transaksi peminjaman (opsional)
//       await prisma.pinjam.delete({
//         where: { id: Number(id) },
//       });
  
//       return response.status(200).json({
//         status: true,
//         message: "Pengembalian berhasil",
//       });
//     } catch (error) {
//       return response.status(400).json({
//         status: false,
//         message: `Error occurred: ${error}`,
//       });
//     }
//   };
  

// export const balikinBarang = async (request: Request, response: Response) => {
//     try {
//       const { id } = request.body; // Extract ID from request body
  
//       if (!id) {
//         return response.status(400).json({
//           status: false,
//           message: "ID is required in the request body.",
//         });
//       }
  
//       // Find the borrowing transaction
//       const findPinjam = await prisma.pinjam.findFirst({
//         where: { id: Number(id) },
//       });
  
//       if (!findPinjam) {
//         return response.status(404).json({
//           status: false,
//           message: `Peminjaman with id: ${id} not found`,
//         });
//       }
  
//       // Find the associated item
//       const findBarang = await prisma.barang.findFirst({
//         where: { id: findPinjam.idBarang },
//       });
  
//       if (!findBarang) {
//         return response.status(404).json({
//           status: false,
//           message: `Barang with id: ${findPinjam.idBarang} not found`,
//         });
//       }
  
//       // Update the item's stock quantity
//       await prisma.barang.update({
//         where: { id: findPinjam.idBarang },
//         data: { quantity: findBarang.quantity + 1 },
//       });
  
//       // Optionally delete the borrowing transaction
//       await prisma.pinjam.delete({
//         where: { id: Number(id) },
//       });
  
//       return response.status(200).json({
//         status: true,
//         message: "Pengembalian berhasil",
//       });
//     } catch (error) {
//         return response.status(400).json({
//           status: false,
//           message: `Error occurred: ${error}`,
//         });
//       }
//     };

// export const balikinBarang = async (request: Request, response: Response) => {
//     try {
//         const { id } = request.body; // Extract ID from request body

//         if (!id) {
//             return response.status(400).json({
//                 status: false,
//                 message: "ID is required in the request body.",
//             });
//         }

//         // Find the borrowing transaction
//         const findPinjam = await prisma.pinjam.findFirst({
//             where: { id: Number(id) },
//         });

//         if (!findPinjam) {
//             return response.status(404).json({
//                 status: false,
//                 message: `Peminjaman with id: ${id} not found`,
//             });
//         }

//         // Find the associated item
//         const findBarang = await prisma.barang.findFirst({
//             where: { id: findPinjam.idBarang },
//         });

//         if (!findBarang) {
//             return response.status(404).json({
//                 status: false,
//                 message: `Barang with id: ${findPinjam.idBarang} not found`,
//             });
//         }

//         // Update the item's stock quantity
//         await prisma.barang.update({
//             where: { id: findPinjam.idBarang },
//             data: { quantity: findBarang.quantity + 1 },
//         });

//         // Record the return date
//         const tanggalPengembalian = new Date().toISOString();

//         // Optionally delete the borrowing transaction
//         await prisma.pinjam.delete({
//             where: { id: Number(id) },
//         });

//         // Return detailed response
//         return response.status(200).json({
//             status: true,
//             message: "Pengembalian berhasil",
//             data: {
//                 id_pinjam: findPinjam.id,
//                 id_barang: findPinjam.idBarang,
//                 id_user: findPinjam.idUser,
//                 tanggal_pengembalian: tanggalPengembalian,
//             },
//         });
//     } catch (error) {
//         return response.status(400).json({
//             status: false,
//             message: `Error occurred: ${error}`,
//         });
//     }
// };



export const balikinBarang = async (request: Request, response: Response) => {
    try {
        const { id, return_date } = request.body; // Extract ID and return_date from request body

        // Validasi input
        if (!id || !return_date) {
            return response.status(400).json({
                status: false,
                message: "ID and return_date are required in the request body.",
            });
        }

        // Parsing dan validasi tanggal pengembalian
        const parsedReturnDate = parse(return_date, "dd-MM-yy", new Date());
        if (isNaN(parsedReturnDate.getTime())) {
            return response.status(400).json({
                status: false,
                message: "Invalid return_date format. Use 'dd-MM-yy'.",
            });
        }

        // Find the borrowing transaction
        const findPinjam = await prisma.pinjam.findFirst({
            where: { id: Number(id) },
        });

        if (!findPinjam) {
            return response.status(404).json({
                status: false,
                message: `Peminjaman with id: ${id} not found`,
            });
        }

        // Find the associated item
        const findBarang = await prisma.barang.findFirst({
            where: { id: findPinjam.idBarang },
        });

        if (!findBarang) {
            return response.status(404).json({
                status: false,
                message: `Barang with id: ${findPinjam.idBarang} not found`,
            });
        }

        // Update the item's stock quantity
        await prisma.barang.update({
            where: { id: findPinjam.idBarang },
            data: { quantity: findBarang.quantity + 1 },
        });

        // Optionally delete the borrowing transaction
        await prisma.pinjam.delete({
            where: { id: Number(id) },
        });

        // Return detailed response
        return response.status(200).json({
            status: true,
            message: "Pengembalian berhasil",
            data: {
                id_pinjam: findPinjam.id,
                id_barang: findPinjam.idBarang,
                id_user: findPinjam.idUser,
                tanggal_pengembalian: format(parsedReturnDate, "dd-MM-yy"),
            },
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `Error occurred: ${error}`,
        });
    }
};

