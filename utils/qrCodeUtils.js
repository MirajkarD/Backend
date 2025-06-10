const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Get local IP address
const getLocalIpAddress = () => {
    const interfaces = os.networkInterfaces();
    for (const interfaceName of Object.keys(interfaces)) {
        const addresses = interfaces[interfaceName];
        for (const addr of addresses) {
            if (addr.family === 'IPv4' && !addr.internal) {
                return addr.address;
            }
        }
    }
    return '192.168.29.6'; // Fallback to default IP
};

// Create a transporter for sending emails
const createTransporter = () => {
    console.log('Creating email transporter with config:', {
        user: process.env.EMAIL_USER,
        hasPassword: Boolean(process.env.EMAIL_PASSWORD)
    });

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Generate QR code for a booking
const generateQRCode = async (bookingData) => {
    try {
        // Get local IP address for the payment URL
        const localIp = getLocalIpAddress();
        
        // Create a payment URL that includes the booking ID, amount, and vehicle number
        const paymentUrl = `http://${localIp}:5174/payment?id=${bookingData._id}&amount=${bookingData.amount}&vehicle=${bookingData.numberPlate}`;
        console.log('Generated payment URL:', paymentUrl);
        
        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, '..', 'temp');
        await fs.mkdir(tempDir, { recursive: true });
        
        // Generate QR code as PNG file
        const qrCodePath = path.join(tempDir, `qr-${bookingData._id}.png`);
        await QRCode.toFile(qrCodePath, paymentUrl, {
            errorCorrectionLevel: 'H',
            width: 300,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        
        return { qrCodePath, paymentUrl };
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};

// Send email with QR code
const sendQRCodeEmail = async (bookingData, userEmail) => {
    try {
        const { qrCodePath, paymentUrl } = await generateQRCode(bookingData);
        const transporter = createTransporter();

        console.log('Attempting to send email to:', userEmail);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Your Parking Booking QR Code',
            html: `
                <h2>Parking Booking Details</h2>
                <p>Booking ID: ${bookingData._id}</p>
                <p>Vehicle Number: ${bookingData.numberPlate}</p>
                <p>Location: ${bookingData.location}</p>
                <p>Amount: ₹${bookingData.amount}</p>
                <p>Please scan the QR code below or click the link to make your payment:</p>
                <p><a href="${paymentUrl}">Click here to pay</a></p>
                <p>Note: If you're scanning this QR code, make sure your phone is connected to the same WiFi network as the computer.</p>
                <img src="cid:qrcode@parking" alt="Payment QR Code"/>
            `,
            attachments: [{
                filename: 'qrcode.png',
                path: qrCodePath,
                cid: 'qrcode@parking' // Content ID for embedding in HTML
            }]
        };

        await transporter.verify();
        console.log('Transporter verified successfully');

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        
        // Clean up: delete the temporary QR code file
        await fs.unlink(qrCodePath).catch(err => 
            console.error('Error deleting temporary QR code file:', err)
        );
        
        return info;
    } catch (error) {
        console.error('Error sending QR code email:', error);
        if (error.code === 'EAUTH') {
            console.error('Authentication failed. Please check your email credentials.');
        }
        throw error;
    }
};

module.exports = {
    generateQRCode,
    sendQRCodeEmail
};
