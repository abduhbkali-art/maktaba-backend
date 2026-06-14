const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
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

// إعداد مخزن الصور (Multer + Cloudinary)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'maktaba_products',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});
const upload = multer({ storage: storage });

// الاتصال بـ MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ Error:", err));

const Product = mongoose.model('Product', new mongoose.Schema({
    nameAr: String, nameEn: String, price: String,
    description: String, imageUrl: String, categoryId: Number
}));

// --- المسارات ---

// 1. رفع صورة فقط (تعيد لنا رابط الصورة)
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        res.json({ imageUrl: req.file.path });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. إضافة منتج
app.post('/api/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
});

// 3. جلب المنتجات
app.get('/api/products', async (req, res) => {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
});

app.listen(process.env.PORT || 3000, () => console.log('🚀 Server Ready with Image Support!'));