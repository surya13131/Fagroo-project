const express = require('express');
const cors = require('cors');
require('dotenv').config();


const productRoutes = require('./routes/productRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');

const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();


app.use(cors({
  origin: 'https://fagroo-project-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/products', productRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
  res.send('Faggro Backend is running successfully!');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});