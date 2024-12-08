import { Request, response, Response } from "express";
import { PrismaClient } from "@prisma/client"
import { BASE_URL } from "../global";
import fs from "fs"
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllBarang = async (request: Request, response: Response) => {
    try {
        const { search } = request.query;
        const allBarang = await prisma.barang.findMany({
            where: { name: { contains: search?.toString() || "" } },
        });
        return response
            .json({
                status: true,
                data: allBarang,
                message: "Barang has retrieved",
            })
            .status(200);
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`,
            })
            .status(400);
    }
};

export const getBarangSingle = async (req: Request, res: Response) => {
    try {
      
      const { id } = req.params;
      const barang = await prisma.barang.findUnique({
        where: { id: Number(id) }, // ID yang diterima sebagai number
      });
  
      // Jika barang tidak ditemukan, kembalikan respons 404
      if (!barang) {
        return res.status(404).json({
          status: false,
          message: `Barang with id: ${id} not found`,
        });
      }
  
      // Kembalikan data barang yang ditemukan
      return res.status(200).json({
        status: true,
        data: barang,
        message: "Barang found successfully",
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
  


// export const createBarang = async (request: Request, response: Response) => {
//     try {
//         const { name, category, location, quantity } = request.body
//         const uuid = uuidv4()

//         // let filename = ""
//         // if (request.file) filename = request.file.filename

//         const newBarang = await prisma.barang.create({
//             data: { uuid, name, category, location, quantity: Number(quantity) }
//         })

//         return response.json({
//             status: true,
//             data: newBarang,
//             message: 'New Barang Has Created'
//         }).status(200)
//     } catch (error) {
//         return response
//             .json({
//                 status: false,
//                 message: 'There is an error. ${error}'
//             })
//             .status(400)
//     }
// }

export const createBarang = async (request: Request, response: Response) => {
    try {
        const { name, category, location, quantity } = request.body;
        
        // Validasi: Pastikan tidak ada data yang kosong
        if (!name || !category || !location || quantity === undefined || quantity === null) {
            return response.status(400).json({
                status: false,
                message: 'All fields are required: name, category, location, and quantity.'
            });
        }

        // Validasi: Pastikan quantity tidak negatif
        if (quantity < 0) {
            return response.status(400).json({
                status: false,
                message: 'Quantity cannot be negative.'
            });
        }

        // Generate UUID
        const uuid = uuidv4();

        // Membuat data barang baru
        const newBarang = await prisma.barang.create({
            data: { 
                uuid, 
                name, 
                category, 
                location, 
                quantity: Number(quantity) // pastikan quantity dikonversi menjadi number
            }
        });

        // Respons sukses
        return response.status(200).json({
            status: true,
            data: newBarang,
            message: 'New Barang Has Created'
        });

    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

export const updatedBarang = async (request: Request, response: Response) => {
    try {
        const { id } = request.params
        const { name, category,location, quantity } = request.body
        const findBarang = await prisma.barang.findFirst({ where: { id: Number(id) } })
        if (!findBarang) return response
            .status(200)
            .json({ status: false, message: 'Barang is not found' })
            
        const updatedBarang = await prisma.barang.update({
            data: {
                name: name || findBarang.name,
                quantity: quantity ? Number(quantity) : findBarang.quantity,
                category: category || findBarang.category,
                location: location || findBarang.location,
                
            },
            where: { id: Number(id) }
        })

        if (quantity && Number(quantity) < 0) {
            return response.status(400).json({
              status: false,
              message: "Quantity cannot be negative",
            });
          }

        return response.json({
            status: true,
            data: updatedBarang,
            message: 'New Barang Has Updated'
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

export const deleteBarang = async (request: Request, response: Response) => {
    try {
        const { id } = request.params
        const findBarang = await prisma.barang.findFirst({ where: { id: Number(id) } })
        if (!findBarang) return response
            .status(200)
            .json({ status: false, massage: `Id: ${id} is not found` })

        // let path = `${BASE_URL}/../public/menu_picture/${findMenu.picture}`
        // let exists = fs.existsSync(path)
        // if (exists && findMenu.picture !== ``) fs.unlinkSync(path)

        const result = await prisma.barang.delete({
            where: { id: Number(request.params.id) }
        })
        return response.json({
            status: true,
            data: result,
            massage: "Barang has been Deleted"
        }).status(200)

    } catch (error) {
        return response.json({
            status: false,
            massage: `There is an error. ${error}`
        })
    }
}



// // Fungsi untuk mengkonversi format tanggal "dd,mm,yy" menjadi objek Date
// const formatDate = (dateStr: string): Date => {
//   const [day, month, year] = dateStr.split(',').map(Number);
//   return new Date(year + 2000, month - 1, day);
// };

// // Fungsi untuk laporan penggunaan barang
// export const getUsageReport = async (req: Request, res: Response) => {
//   const { startDate, endDate, category, location } = req.body;

//   // Konversi tanggal dari string ke objek Date
//   const start = formatDate(startDate);
//   const end = formatDate(endDate);

//   try {
//     // Ambil data pinjam dari database berdasarkan filter yang diberikan
//     const filteredData = await prisma.pinjam.findMany({
//       where: {
//         borrow_date: {
//           gte: start,
//           lte: end,
//         },
//         category: category || undefined,
//         location: location || undefined,
//       },
//       include: {
//         Barang: true, // Menyertakan data barang yang dipinjam
//       },
//     });

//     // Hitung total barang dipinjam, dikembalikan, dan yang masih digunakan
//     const totalBorrowed = filteredData.length;
//     const totalReturned = filteredData.filter(item => item.return_date !== null).length;
//     const stillInUse = filteredData.filter(item => item.return_date === null);

//     // Kirimkan response dengan hasil analisis
//     res.json({
//       startDate,
//       endDate,
//       totalBorrowed,
//       totalReturned,
//       stillInUse,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Terjadi kesalahan saat mengambil data" });
//   }
// };


// export const analisis = async (request: Request, response: Response) => {
//     const { start_date, end_date, group_by } = request.body;

//     if (!start_date || !end_date || !group_by) {
//         return response.status(400).json({
//             status: "error",
//             message: "Tanggal mulai, tanggal akhir, dan kriteria pengelompokan harus diisi.",
//         });
//     }

//     const startDate = new Date(start_date);
//     const endDate = new Date(end_date);

//     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//         return response.status(400).json({
//             status: "error",
//             message: "Format tanggal tidak valid.",
//         });
//     }

//     try {
//         let usageReport;
//         let additionalInfo: Array<{ id_barang: number, [key: string]: any }> = [];
//         if (group_by === 'category') {
//             usageReport = await prisma.pinjam.groupBy({
//                 by: ['id'],
//                 where: {
//                     borrow_date: {
//                         gte: startDate,
//                     },
//                 },
//                 _count: {
//                     id: true,
//                 },
//                 _sum: {
//                     quantity: true,
//                 },
//             });
        
//             // KATEGORY
//             const ids = usageReport.map(item => item.id);
//             additionalInfo = await prisma.barang.findMany({
//                 where: {
//                     id: { in: ids }
//                 },
//                 select: { id: true, category: true },
//             }).then(data => data.map(item => ({
//                 id_barang: item.id,  // Alias untuk id_barang
//                 category: item.category,
//             })));
//         } else if (group_by === 'location') {
//             usageReport = await prisma.pinjam.groupBy({
//                 by: ['id'],
//                 where: {
//                     borrow_date: {
//                         gte: startDate,
//                     },
//                 },
//                 _count: {
//                     id: true,
//                 },
//                 _sum: {
//                     quantity: true,
//                 },
//             });
        
//             // LOCATION
//             const ids = usageReport.map(item => item.id);
//             additionalInfo = await prisma.barang.findMany({
//                 where: {
//                     id: { in: ids }
//                 },
//                 select: { id: true, location: true },
//             }).then(data => data.map(item => ({
//                 id_barang: item.id,  // Alias untuk id_barang
//                 location: item.location,
//             })));
//         }
        

//         //menghitung peminjaman yang sudah dikembalikan
//         const returnedItems = await prisma.pinjam.groupBy({
//             by: ['id'],
//             where: {
//                 borrow_date: {
//                     gte: startDate,
//                 },
//                 AND: [
//                     {
//                         return_date: {
//                             lte: endDate,
//                         }
//                     },
//                     {
//                         return_date: {
//                             not: new Date(0)
//                         }
//                     }
//                 ]
//             },
//             _count: {
//                 id: true,
//             },
//             _sum: {
//                 quantity: true,
//             },
//         });

//         //menghitung peminjaman yang belum dikembalikan
//         const notReturnedItems = await prisma.pinjam.groupBy({
//             by: ['id'],
//             where: {
//                 borrow_date: {
//                     gte: startDate,
//                 },
//                 OR: [
//                     {
//                         return_date: {
//                             gt: endDate,
//                         }
//                     },
//                     {
//                         return_date: {
//                             not: new Date(0)
//                         }
//                     }
//                 ]
//             },
//             _count: {
//                 id: true,
//             },
//             _sum: {
//                 quantity: true,
//             },
//         });

//         if(!usageReport) {
//             return response.json({
//                 status: 'error',
//                 message: 'Usage report not found',
//             })
//         }

//         // Menyusun hasil analisis untuk respons
//         const usageAnalysis = usageReport.map(item => {
//             const info = additionalInfo.find(info => info.id === item.id);
//             const returnedItem = returnedItems.find(returned => returned.id === item.id);
//             const totalReturned = returnedItem?._count?.id ?? 0; // Jika _count id_barang null, gunakan 0
//             const itemsInUse = item._count.id - totalReturned;
//             return {
//                 group: info ? info[group_by as keyof typeof info] : 'Unknown',
//                 total_borrowed: item._count.id,
//                 total_returned: totalReturned,
//                 items_in_use: itemsInUse
//             };
//         });

//         response.status(200).json({
//             status: "success",
//             data: {
//                 analysis_period: {
//                     start_date: startDate.toISOString().split('T')[0],
//                     end_date: endDate.toISOString().split('T')[0]
//                 },
//                 usage_analysis: usageAnalysis
//             },
//             message: "Laporan penggunaan barang berhasil dihasilkan.",
//         });
//     } catch (error) {
//         response.status(500).json({
//             status: "error",
//             message: `Terjadi kesalahan. ${(error as Error).message}`,
//         });
//     }
// };


export const analisis = async (request: Request, response: Response) => {
    try {
        // Ambil parameter dari body request
        const { start_date, end_date, group_by } = request.body;

        // Validasi input
        if (!start_date || !end_date || !group_by) {
            return response.status(400).json({
                status: "error",
                message: "Tanggal mulai, tanggal akhir, dan kriteria pengelompokan harus diisi.",
            });
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return response.status(400).json({
                status: "error",
                message: "Format tanggal tidak valid.",
            });
        }

        if (group_by !== 'category' && group_by !== 'location') {
            return response.status(400).json({
                status: "error",
                message: "Kriteria pengelompokan harus 'category' atau 'location'.",
            });
        }

        // Ambil data peminjaman berdasarkan rentang tanggal
        const usageReport = await prisma.pinjam.groupBy({
            by: ['id'],
            where: {
                borrow_date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _count: {
                id: true,
            },
        });

        if (usageReport.length === 0) {
            return response.status(404).json({
                status: "error",
                message: "Tidak ada data peminjaman pada rentang tanggal tersebut.",
            });
        }

        // Ambil informasi tambahan berdasarkan group_by
        const ids = usageReport.map(item => item.id);
        const additionalInfo = await prisma.barang.findMany({
            where: {
                id: { in: ids },
            },
            select: {
                id: true,
                [group_by]: true,
            },
        });

        // Menghitung jumlah barang yang dikembalikan dan belum dikembalikan
        const returnedItems = await prisma.pinjam.groupBy({
            by: ['id'],
            where: {
                borrow_date: {
                    gte: startDate,
                    lte: endDate,
                },
                return_date: {
                    not: null,
                },
            },
            _count: {
                id: true,
            },
        });

        // Menyusun hasil analisis
        const usageAnalysis = usageReport.map(item => {
            const info = additionalInfo.find(info => info.id === item.id);
            const returnedItem = returnedItems.find(returned => returned.id === item.id);
            const totalReturned = returnedItem?._count?.id ?? 0;
            const itemsInUse = item._count.id - totalReturned;

            return {
                group: info ? info[group_by] : 'Unknown',
                total_borrowed: item._count.id,
                total_returned: totalReturned,
                items_in_use: itemsInUse,
            };
        });

        // Mengembalikan respons
        return response.status(200).json({
            status: "success",
            data: {
                analysis_period: {
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0],
                },
                usage_analysis: usageAnalysis,
            },
            message: "Laporan penggunaan barang berhasil dihasilkan.",
        });
    } catch (error) {
        // Menangani kesalahan
        return response.status(500).json({
            status: "error",
            message: `Terjadi kesalahan: ${(error as Error).message}`,
        });
    }
};


// export const borrowAnalysis = async (request: Request, response: Response) => {
//     const { start_date, end_date } = request.body;

//     // Validasi input
//     if (!start_date || !end_date) {
//         return response.status(400).json({
//             status: "error",
//             message: "Tanggal mulai dan tanggal akhir harus diisi.",
//         });
//     }

//     // Validasi format tanggal
//     const startDate = new Date(start_date);
//     const endDate = new Date(end_date);

//     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//         return response.status(400).json({
//             status: "error",
//             message: "Format tanggal tidak valid.",
//         });
//     }

//     try {
//         // Query untuk mendapatkan barang paling sering dipinjam
//         const frequentlyBorrowedItems = await prisma.pinjam.groupBy({
//             by: ['id'],
//             where: {
//                 borrow_date: {
//                     gte: startDate,
//                 },
//                 return_date: {
//                     lte: endDate,
//                 },
//             },
//             _count: {
//                 id: true,
//             },
//             orderBy: {
//                 _count: {
//                     id: 'desc',
//                 }
//             },
//         });

//         // Mendapatkan informasi tambahan untuk barang paling sering dipinjam
//         const frequentlyBorrowedItemDetails = await Promise.all(frequentlyBorrowedItems.map(async item => {
//             const barang = await prisma.barang.findUnique({
//                 where: { id: item.id },
//                 select: { id: true, name: true, category: true },
//             });
//             return barang ? {
//                 item_id: item.id,
//                 name: barang.name,
//                 category: barang.category,
//                 total_borrowed: item._count.id,
//             } : null;
//         })).then(results => results.filter(item => item !== null)); // Menghapus item yang null

//         // Query untuk mendapatkan barang dengan telat pengembalian
//         const inefficientItems = await prisma.pinjam.groupBy({
//             by: ['id'],
//             where: {
//                 borrow_date: {
//                     gte: startDate,
//                 },
//                 return_date: {
//                     gt: endDate // Asumsikan telat pengembalian adalah jika return_date lebih besar dari end_date
//                 }
//             },
//             _count: {
//                 id: true,
//             },
//             _sum: {
//                 quantity: true,
//             },
//             orderBy: {
//                 _count: {
//                     id: 'desc',
//                 }
//             },
//         });

//         // Mendapatkan informasi tambahan untuk barang yang telat pengembalian
//         const inefficientItemDetails = await Promise.all(inefficientItems.map(async item => {
//             const barang = await prisma.barang.findUnique({
//                 where: { id: item.id },
//                 select: { id: true, name: true, category: true },
//             });
//             return barang ? {
//                 item_id: item.id,
//                 name: barang.name,
//                 category: barang.category,
//                 total_borrowed: item._count.id,
//                 total_late_returns: item._sum.quantity ?? 0, // Menangani kemungkinan nilai undefined
//             } : null;
//         })).then(results => results.filter(item => item !== null)); // Menghapus item yang null

//         response.status(200).json({
//             status: "success",
//             data: {
//                 analysis_period: {
//                     start_date: start_date,
//                     end_date: end_date
//                 },
//                 frequently_borrowed_items: frequentlyBorrowedItemDetails,
//                 inefficient_items: inefficientItemDetails
//             },
//             message: "Analisis barang berhasil dihasilkan.",
//         });
//     } catch (error) {
//         response.status(500).json({
//             status: "error",
//             message: `Terjadi kesalahan. ${(error as Error).message}`,
//         });
//     }
// };



export const borrowAnalysis = async (request: Request, response: Response) => {
    try {
        // Ambil parameter dari body request
        const { start_date, end_date } = request.body;

        // Validasi input
        if (!start_date || !end_date) {
            return response.status(400).json({
                status: "error",
                message: "Tanggal mulai dan tanggal akhir harus diisi.",
            });
        }

        // Validasi format tanggal
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return response.status(400).json({
                status: "error",
                message: "Format tanggal tidak valid.",
            });
        }

        // Query barang paling sering dipinjam
        const frequentlyBorrowedItems = await prisma.pinjam.groupBy({
            by: ['id'],
            where: {
                borrow_date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
        });

        // Ambil detail barang paling sering dipinjam
        const frequentlyBorrowedItemDetails = await prisma.barang.findMany({
            where: {
                id: { in: frequentlyBorrowedItems.map(item => item.id) },
            },
            select: {
                id: true,
                name: true,
                category: true,
            },
        });

        // Gabungkan data barang dengan jumlah peminjaman
        const frequentlyBorrowedDetails = frequentlyBorrowedItems.map(item => {
            const detail = frequentlyBorrowedItemDetails.find(barang => barang.id === item.id);
            return detail
                ? {
                      item_id: item.id,
                      name: detail.name,
                      category: detail.category,
                      total_borrowed: item._count.id,
                  }
                : null;
        }).filter(item => item !== null);

        // Query barang dengan pengembalian terlambat
        const inefficientItems = await prisma.pinjam.groupBy({
            by: ['id'],
            where: {
                borrow_date: {
                    gte: startDate,
                },
                return_date: {
                    gt: endDate, // Barang dikembalikan setelah end_date
                },
            },
            _count: {
                id: true,
            },
            _sum: {
                quantity: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
        });

        // Ambil detail barang dengan pengembalian terlambat
        const inefficientItemDetails = await prisma.barang.findMany({
            where: {
                id: { in: inefficientItems.map(item => item.id) },
            },
            select: {
                id: true,
                name: true,
                category: true,
            },
        });

        // Gabungkan data barang dengan jumlah pengembalian terlambat
        const inefficientDetails = inefficientItems.map(item => {
            const detail = inefficientItemDetails.find(barang => barang.id === item.id);
            return detail
                ? {
                      item_id: item.id,
                      name: detail.name,
                      category: detail.category,
                      total_borrowed: item._count.id,
                      total_late_returns: item._sum.quantity ?? 0,
                  }
                : null;
        }).filter(item => item !== null);

        // Mengembalikan respons
        return response.status(200).json({
            status: "success",
            data: {
                analysis_period: {
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0],
                },
                frequently_borrowed_items: frequentlyBorrowedDetails,
                inefficient_items: inefficientDetails,
            },
            message: "Analisis barang berhasil dihasilkan.",
        });
    } catch (error) {
        // Menangani error
        return response.status(500).json({
            status: "error",
            message: `Terjadi kesalahan: ${(error as Error).message}`,
        });
    }
};
