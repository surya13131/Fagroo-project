const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Route Imports
const productRoutes = require('./routes/productRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const adminRoutes = require('./routes/adminRoutes'); 

// Middleware Imports
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Basic Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/admin', adminRoutes); 

// Health Check Route
app.get('/', (req, res) => {
  res.send('Faggro Backend is running successfully!');
});

// Custom Global Error Handler (Replaces the inline try/catch handler)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});