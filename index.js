const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// إعدادات Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// الاتصال بـ MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// تعريف شكل المنتج في قاعدة البيانات
const productSchema = new mongoose.Schema({
    nameAr: String,
    nameEn: String,
    price: String,
    description: String,
    imageUrl: String,
    categoryId: Number,
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// --- المسارات (API Routes) ---

// 1. جلب كل المنتجات
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. إضافة منتج جديد
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. تجربة السيرفر
app.get('/', (req, res) => {
    res.send('Server is running! 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server is active on port ${PORT}`));