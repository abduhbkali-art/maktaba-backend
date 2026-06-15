const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// 1. إعدادات Cloudinary لرفع الصور
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { 
        folder: 'maktaba_products',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});
const upload = multer({ storage: storage });

// 2. الربط بقاعدة بيانات MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ Connection Error:", err));

// 3. تعريف هيكل المنتجات (Product Schema)
const productSchema = new mongoose.Schema({
    nameAr: String,
    nameEn: String,
    price: String,
    description: String,
    imageUrl: String,
    categoryId: Number,
    colors: [String],
    types: [String],
    createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

// 4. تعريف هيكل الطلبات (Order Schema)
const orderSchema = new mongoose.Schema({
    items: Array,
    totalAmount: String,
    address: Object,
    notes: String,
    status: { type: String, default: 'PENDING' },
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// --- 5. المسارات (API Routes) ---

// جلب جميع المنتجات
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// إضافة منتج جديد
app.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// حذف منتج عن طريق الـ ID
app.delete('/api/products/:id', async (req, res) => {
    try {
        const result = await Product.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: "المنتج غير موجود" });
        res.json({ message: "تم حذف المنتج بنجاح" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// رفع صورة والحصول على الرابط
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        res.json({ imageUrl: req.file.path });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// استقبال طلبات الشراء الجديدة
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// اختبار السيرفر
app.get('/', (req, res) => {
    res.send('<h1>🚀 Maktaba Backend is Live and Ready!</h1>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server active on port ${PORT}`));