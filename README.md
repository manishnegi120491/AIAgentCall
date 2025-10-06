# AI Call Agent - React & Node.js

A modern full-stack application for making AI-powered phone calls using React frontend and Node.js backend with Twilio integration.

## 🏗️ Project Structure

```
ai-call-agent/
├── backend/                 # Node.js Express API server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   ├── test-config.js      # Twilio configuration test
│   └── env.example         # Environment variables template
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── CallInterface.tsx
│   │   ├── App.tsx         # Main App component
│   │   └── App.css         # Styling
│   └── package.json        # Frontend dependencies
└── README.md              # This file
```

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern UI**: Clean, responsive design with gradient backgrounds
- **TypeScript**: Type-safe development with full IntelliSense
- **Real-time Status**: Live call status updates and error handling
- **Phone Validation**: Automatic phone number formatting and validation
- **Loading States**: Smooth loading animations and user feedback
- **Mobile Responsive**: Works perfectly on all device sizes

### Backend (Node.js + Express)
- **RESTful API**: Clean API endpoints for call management
- **Twilio Integration**: Full voice calling capabilities
- **AI Conversation**: Intelligent response handling
- **Webhook Support**: Twilio webhook endpoints for call handling
- **CORS Enabled**: Secure cross-origin requests
- **Error Handling**: Comprehensive error management

## 🛠️ Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Twilio Account** with phone number
- **ngrok** (for local development with webhooks)

## 📦 Installation

### 1. Clone and Setup

```bash
# Navigate to project directory
cd ai-call-agent

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

#### Backend Configuration
Create a `.env` file in the `backend/` directory:

```bash
# Copy the example file
cp backend/env.example backend/.env
```

Edit `backend/.env` with your Twilio credentials:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_actual_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Base URL for webhooks (use ngrok for local development)
BASE_URL=https://your-ngrok-url.ngrok.io

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=5000
```

### 3. Get Twilio Credentials

1. Sign up at [twilio.com](https://www.twilio.com)
2. Get Account SID and Auth Token from [Twilio Console](https://console.twilio.com/)
3. Purchase a phone number from Twilio Console
4. Note your phone number (include country code, e.g., +1234567890)

### 4. Setup ngrok (for webhooks)

```bash
# Install ngrok
# Download from: https://ngrok.com/download

# Start ngrok (in a separate terminal)
ngrok http 5000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update BASE_URL in your .env file
```

### 5. Configure Twilio Webhooks

In your Twilio Console:
1. Go to Phone Numbers > Manage > Active Numbers
2. Click on your Twilio phone number
3. Set webhook URL to: `https://your-ngrok-url.ngrok.io/voice`
4. Set HTTP method to POST
5. Save configuration

## 🚀 Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Start Frontend Development Server
```bash
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

### Production Mode

#### Build Frontend
```bash
cd frontend
npm run build
```

#### Start Backend
```bash
cd backend
npm start
```

## 🔧 API Endpoints

### Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/call` | Initiate a new call |
| POST | `/voice` | Twilio webhook - call handling |
| POST | `/voice/process` | Process user input during call |
| POST | `/voice/continue` | Continue AI conversation |
| POST | `/voice/goodbye` | End call gracefully |

### Example API Usage

```javascript
// Make a call
const response = await fetch('http://localhost:5000/api/call', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phoneNumber: '+1234567890'
  })
});

const data = await response.json();
console.log(data);
```

## 🎯 How It Works

1. **User Input**: User enters phone number in React frontend
2. **API Request**: Frontend sends POST request to backend `/api/call`
3. **Twilio Call**: Backend uses Twilio API to initiate the call
4. **AI Conversation**: When answered, Twilio plays AI-generated responses
5. **Interactive Flow**: Users interact via phone keypad
6. **Status Updates**: Real-time updates shown in frontend

## 🧪 Testing

### Test Twilio Configuration
```bash
cd backend
node test-config.js
```

### Test API Health
```bash
curl http://localhost:5000/api/health
```

## 🐛 Troubleshooting

### Common Issues

1. **"accountSid must start with AC"**
   - Verify your Twilio Account SID is correct
   - Check `.env` file has proper credentials

2. **CORS Errors**
   - Ensure `FRONTEND_URL` is set in backend `.env`
   - Check that frontend is running on correct port

3. **Webhook Not Receiving Calls**
   - Verify ngrok is running and accessible
   - Check webhook URL in Twilio Console
   - Ensure `BASE_URL` matches your ngrok URL

4. **"Failed to initiate call"**
   - Verify Twilio credentials are correct
   - Check account has sufficient balance
   - Ensure phone number is verified (trial accounts)

## 📱 Features in Detail

### AI Agent Capabilities
- **Intelligent Greeting**: Context-aware welcome messages
- **Dynamic Responses**: Multiple response variations
- **Interactive Menu**: Phone keypad navigation
- **Voice Recording**: Message recording capability
- **Graceful Termination**: Professional call ending

### Frontend Features
- **Real-time Validation**: Instant phone number formatting
- **Loading States**: Visual feedback during operations
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on all screen sizes
- **Modern UI**: Beautiful gradient design with animations

## 🔒 Security Notes

- Never commit `.env` files to version control
- Keep Twilio credentials secure
- Use environment variables for all sensitive data
- Consider implementing rate limiting for production
- Use HTTPS in production environments

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review Twilio documentation
- Open an issue in the repository

---

**Happy Calling! 🎉**
