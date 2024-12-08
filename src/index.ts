import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoute';
import barangRoutes from './routes/barangRoute';
import pinjamRoutes from './routes/pinjamRoute';
import balikinRoutes from './routes/balikinRoute';
import { errorHandler } from './middlewares/errorHandling';

const PORT : number = 8080
const app = express()
app.use(cors())

// Middleware
app.use(cors());
app.use(express.json());

// Route registrations
app.use('/api/users', userRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/pinjam', pinjamRoutes);
app.use('/api/balikin', balikinRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
