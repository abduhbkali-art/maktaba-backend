const express = require('express');
const twilio = require('twilio');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const accountSid = 'AC5bc761b161bdcc4e8d1ba336577ad438';
const authToken = 'f064b8bc5635deb79d881ef0fe576b79';
const twilioClient = new twilio(accountSid, authToken);

const otpStorage = {};

app.post('/api/auth/send-otp', async (req, res) => {
    const { phoneNumber, type } = req.body; // type: 'whatsapp' أو 'sms'
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const formattedNumber = `+967${phoneNumber.replace(/^0+/, '')}`;

    try {
        if (type === 'whatsapp') {
            // إرسال عبر واتساب
            await twilioClient.messages.create({
                from: 'whatsapp:+14155238886',
                to: `whatsapp:${formattedNumber}`,
                body: `كود التحقق الخاص بك لمكتبة الشرق الأوسط هو: ${otp}`
            });
        } else {
            // إرسال عبر SMS عادي
            await twilioClient.messages.create({
                from: '+1234567890', // ضع هنا رقم SMS الذي اشتريته من تويليو
                to: formattedNumber,
                body: `كود التحقق الخاص بك هو: ${otp}`
            });
        }

        otpStorage[phoneNumber] = otp;
        res.status(200).json({ success: true, message: "تم إرسال الكود" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "فشل الإرسال: " + error.message });
    }
});

app.listen(3000, () => console.log('🚀 Server running on port 3000'));