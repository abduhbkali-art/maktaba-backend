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

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'maktaba_products', allowed_formats: ['jpg', 'png', 'jpeg'] }
});
const upload = multer({ storage: storage });

mongoose.connect(process.env.MONGO_URI).then(() => console.log("✅ Connected"));

// موديل المنتج المطور
const Product = mongoose.model('Product', new mongoose.Schema({
    nameAr: String, nameEn: String, price: String, description: String,
    imageUrl: String, categoryId: Number,
    colors: [String], types: [String], inStock: { type: Boolean, default: true }
}));

// موديل الطلبات
const Order = mongoose.model('Order', new mongoose.Schema({
    items: Array, totalAmount: String, address: Object,
    status: { type: String, default: 'PENDING' },
    createdAt: { type: Date, default: Date.now }
}));

app.post('/api/upload', upload.single('image'), (req, res) => {
    res.json({ imageUrl: req.file.path });
});

app.post('/api/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
});

app.get('/api/products', async (req, res) => {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
});

// مسار إرسال طلب جديد
app.post('/api/orders', async (req, res) => {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
});

app.listen(process.env.PORT || 3000, () => console.log('🚀 Server Fully Functional!'));