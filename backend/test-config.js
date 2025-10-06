// Test script to verify Twilio configuration
require('dotenv').config();
const twilio = require('twilio');

console.log('🔧 Testing Twilio configuration...');
console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Not set');
console.log('Auth Token:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Not set');
console.log('Phone Number:', process.env.TWILIO_PHONE_NUMBER || '❌ Not set');
console.log('Base URL:', process.env.BASE_URL || '❌ Not set');
console.log('Frontend URL:', process.env.FRONTEND_URL || '❌ Not set');

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        console.log('✅ Twilio client initialized successfully!');
    } catch (error) {
        console.error('❌ Error initializing Twilio client:', error.message);
    }
} else {
    console.log('⚠️  Please set your Twilio credentials in the .env file');
}
