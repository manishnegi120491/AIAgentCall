const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
const VapiService = require('./services/vapiService');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Twilio client (only if credentials are provided)
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} else {
    console.warn('⚠️  Twilio credentials not found. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your .env file');
}

// Initialize Vapi service
const vapiService = new VapiService();

// AI Agent responses
const aiResponses = [
    "Hello! I'm your AI assistant. How can I help you today?",
    "I understand you're calling about our services. Let me help you with that.",
    "Thank you for calling. I'm here to assist you with any questions you might have.",
    "I can help you with information about our products and services.",
    "Is there anything specific you'd like to know more about?",
    "I'm processing your request. Please hold on for a moment.",
    "Thank you for your patience. I'm here to help you.",
    "I can provide you with detailed information about our offerings.",
    "Let me connect you with the right information.",
    "I'm here to make sure you get the help you need."
];

// TwiML for AI agent conversation with continuous background music
function generateTwiML(musicType = 'traditional-second', customMessage = null) {
    const response = new twilio.twiml.VoiceResponse();
    
    // Play only background music
    if (musicType === 'traditional-second') {
        // Mafia - 51 Glorious Days by Yo Yo Honey Singh
        response.play('https://linen-mandrill-7255.twil.io/assets/Mafia%2051%20Glorious%20Days%20128%20Kbps.mp3', { loop: 0 });
    } else if (musicType === 'traditional-first') {
        // Vande Mataram
        response.play('https://linen-mandrill-7255.twil.io/assets/Gurus%20Of%20Peace%20Vande%20Mataram%20128%20Kbps.mp3', { loop: 0 });
    } else if (musicType === 'custom') {
        // For custom messages, play the message as voice
        const greetingMessage = customMessage || 'Hello! You have reached our AI assistant. I am here to help you with any questions you may have.';
        response.say({
            voice: 'alice',
            language: 'en-US'
        }, greetingMessage);
    }
    
    // Keep the call active by playing music continuously
    response.pause({ length: 30 });
    response.redirect('/voice');
    
    return response.toString();
}

// Process user input with continuous background music
function processUserInput(digit) {
    const response = new twilio.twiml.VoiceResponse();
    
    if (digit === '1') {
        // AI conversation
        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        response.say({
            voice: 'alice',
            language: 'en-US'
        }, randomResponse);
        
        // Continue conversation
        const gather = response.gather({
            numDigits: 1,
            action: '/voice/continue',
            method: 'POST',
            timeout: 15
        });
        
        gather.say({
            voice: 'alice',
            language: 'en-US'
        }, 'Press 1 to continue the conversation, or press 2 to end the call.');
        
        // Fallback
        response.redirect('/voice/goodbye');
    } else if (digit === '2') {
        // Background music during voicemail
        response.play('// https://linen-mandrill-7255.twil.io/assets/Gurus%20Of%20Peace%20Vande%20Mataram%20128%20Kbps.mp3', { loop: 2 });
        
        response.say({
            voice: 'alice',
            language: 'en-US'
        }, 'Please leave your message after the beep.');
        response.record({
            maxLength: 30,
            action: '/voice/recorded',
            method: 'POST'
        });
    } else {
        // Background music for error message
        response.play('// https://linen-mandrill-7255.twil.io/assets/Gurus%20Of%20Peace%20Vande%20Mataram%20128%20Kbps.mp3', { loop: 1 });
        
        response.say({
            voice: 'alice',
            language: 'en-US'
        }, 'I did not understand your selection. Please try again.');
        response.redirect('/voice');
    }
    
    return response.toString();
}

// Continue conversation with continuous background music
function continueConversation(digit) {
    const response = new twilio.twiml.VoiceResponse();
    
    if (digit === '1') {
        // Continue background music during continued conversation
        response.play('// https://linen-mandrill-7255.twil.io/assets/Gurus%20Of%20Peace%20Vande%20Mataram%20128%20Kbps.mp3', { loop: 6 });
        
        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        response.say({
            voice: 'alice',
            language: 'en-US'
        }, randomResponse);
        
        // Keep background music playing
        response.play('// https://linen-mandrill-7255.twil.io/assets/Gurus%20Of%20Peace%20Vande%20Mataram%20128%20Kbps.mp3', { loop: 4 });
        
        const gather = response.gather({
            numDigits: 1,
            action: '/voice/continue',
            method: 'POST',
            timeout: 15
        });
        
        gather.say({
            voice: 'alice',
            language: 'en-US'
        }, 'Press 1 to continue, or press 2 to end the call.');
        response.redirect('/voice/goodbye');
    } else {
        response.redirect('/voice/goodbye');
    }
    
    return response.toString();
}

// Goodbye message with background music
function goodbye() {
    const response = new twilio.twiml.VoiceResponse();
    
    // Play background music during goodbye
    response.play('// https://linen-mandrill-7255.twil.io/assets/Gurus%20Of%20Peace%20Vande%20Mataram%20128%20Kbps.mp3', { loop: 3 });
    
    response.say({
        voice: 'alice',
        language: 'en-US'
    }, 'Thank you for calling. Have a great day! Goodbye.');
    
    // Final background music before hangup
    response.play('// https://linen-mandrill-7255.twil.io/assets/Gurus%20Of%20Peace%20Vande%20Mataram%20128%20Kbps.mp3', { loop: 1 });
    
    response.hangup();
    return response.toString();
}

// Handle recorded message
function handleRecorded() {
    const response = new twilio.twiml.VoiceResponse();
    response.say('Thank you for your message. We will get back to you soon. Goodbye.');
    response.hangup();
    return response.toString();
}

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'AI Call Agent Backend',
        twilio: !!client,
        vapi: vapiService.isConfigured()
    });
});

// Vapi configuration status
app.get('/api/vapi/status', (req, res) => {
    const config = vapiService.getConfigStatus();
    res.json({
        configured: config.configured,
        apiKey: config.apiKey,
        assistantId: config.assistantId,
        message: config.configured ? 'Vapi is properly configured' : 'Vapi configuration incomplete'
    });
});

// Get available assistants
app.get('/api/vapi/assistants', async (req, res) => {
    try {
        const assistants = await vapiService.getAssistants();
        res.json({ success: true, assistants });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch assistants',
            details: error.message 
        });
    }
});

// Generate Twilio access token for Voice SDK
app.get('/api/voice/token', (req, res) => {
    try {
        if (!client) {
            return res.status(503).json({ 
                error: 'Twilio service not configured',
                details: 'Please set up your Twilio credentials in the .env file'
            });
        }

        // Generate access token for Voice SDK
        const AccessToken = twilio.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;

        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: process.env.TWILIO_APPLICATION_SID || 'default',
            incomingAllow: true,
        });

        const token = new AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_API_KEY || process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_API_SECRET || process.env.TWILIO_AUTH_TOKEN,
            { identity: 'voice-user' }
        );

        token.addGrant(voiceGrant);

        res.json({
            token: token.toJwt(),
            identity: 'voice-user'
        });

    } catch (error) {
        console.error('Error generating access token:', error);
        res.status(500).json({ 
            error: 'Failed to generate access token',
            details: error.message 
        });
    }
});

// API endpoint to initiate call (Twilio)
app.post('/api/call', async (req, res) => {
    try {
        const { phoneNumber, musicType = 'traditional-second', customMessage } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Validate phone number format
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

        // Check if Twilio client is available
        if (!client) {
            return res.status(503).json({ 
                error: 'Twilio service not configured',
                details: 'Please set up your Twilio credentials in the .env file'
            });
        }

        // Make the call using Twilio
        const callUrl = customMessage 
            ? `${process.env.BASE_URL || 'http://localhost:5000'}/voice?music=${musicType}&customMessage=${encodeURIComponent(customMessage)}`
            : `${process.env.BASE_URL || 'http://localhost:5000'}/voice?music=${musicType}`;
            
        const call = await client.calls.create({
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER,
            url: callUrl,
            method: 'POST'
        });

        console.log(`Twilio call initiated to ${phoneNumber}, Call SID: ${call.sid}, Music: ${musicType}`);
        
        res.json({ 
            success: true, 
            callSid: call.sid,
            provider: 'twilio',
            musicType: musicType,
            message: 'Call initiated successfully with Twilio'
        });

    } catch (error) {
        console.error('Error making Twilio call:', error);
        res.status(500).json({ 
            error: 'Failed to initiate call',
            details: error.message 
        });
    }
});

// API endpoint to initiate call with Vapi AI
app.post('/api/call/vapi', async (req, res) => {
    try {
        const { phoneNumber, options = {}, customMessage } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Validate phone number format
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

        // Check if Vapi is configured
        if (!vapiService.isConfigured()) {
            return res.status(503).json({ 
                error: 'Vapi service not configured',
                details: 'Please set up your Vapi API key and Assistant ID in the .env file'
            });
        }

        // Add custom message to options if provided
        const vapiOptions = { ...options };
        if (customMessage) {
            vapiOptions.customMessage = customMessage;
        }

        // Make the call using Vapi
        const result = await vapiService.createCall(phoneNumber, vapiOptions);

        console.log(`Vapi AI call initiated to ${phoneNumber}, Call ID: ${result.callId}`);
        
        res.json({ 
            success: true, 
            callId: result.callId,
            status: result.status,
            provider: 'vapi',
            message: result.message
        });

    } catch (error) {
        console.error('Error making Vapi call:', error);
        res.status(500).json({ 
            error: 'Failed to initiate Vapi call',
            details: error.message 
        });
    }
});

// Get Vapi call status
app.get('/api/call/vapi/:callId', async (req, res) => {
    try {
        const { callId } = req.params;
        
        if (!vapiService.isConfigured()) {
            return res.status(503).json({ 
                error: 'Vapi service not configured',
                details: 'Please set up your Vapi API key and Assistant ID in the .env file'
            });
        }

        const status = await vapiService.getCallStatus(callId);
        res.json({ success: true, call: status });

    } catch (error) {
        console.error('Error getting Vapi call status:', error);
        res.status(500).json({ 
            error: 'Failed to get call status',
            details: error.message 
        });
    }
});

// End Vapi call
app.post('/api/call/vapi/:callId/end', async (req, res) => {
    try {
        const { callId } = req.params;
        
        if (!vapiService.isConfigured()) {
            return res.status(503).json({ 
                error: 'Vapi service not configured',
                details: 'Please set up your Vapi API key and Assistant ID in the .env file'
            });
        }

        const result = await vapiService.endCall(callId);
        res.json({ success: true, message: 'Call ended successfully', result });

    } catch (error) {
        console.error('Error ending Vapi call:', error);
        res.status(500).json({ 
            error: 'Failed to end call',
            details: error.message 
        });
    }
});

// Twilio webhook endpoints
app.post('/voice', (req, res) => {
    const musicType = req.query.music || 'traditional-second';
    const customMessage = req.query.customMessage;
    const twiml = generateTwiML(musicType, customMessage);
    res.type('text/xml');
    res.send(twiml);
});

app.post('/voice/process', (req, res) => {
    const digit = req.body.Digits;
    const twiml = processUserInput(digit);
    res.type('text/xml');
    res.send(twiml);
});

app.post('/voice/continue', (req, res) => {
    const digit = req.body.Digits;
    const twiml = continueConversation(digit);
    res.type('text/xml');
    res.send(twiml);
});

app.post('/voice/goodbye', (req, res) => {
    const twiml = goodbye();
    res.type('text/xml');
    res.send(twiml);
});

app.post('/voice/recorded', (req, res) => {
    const twiml = handleRecorded();
    res.type('text/xml');
    res.send(twiml);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 AI Call Agent Backend running on port ${port}`);
    console.log(`📞 Frontend should connect to: http://localhost:${port}`);
    console.log('🔧 Make sure to set up your .env file with Twilio credentials');
});
