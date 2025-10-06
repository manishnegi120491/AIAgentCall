const axios = require('axios');

class VapiService {
    constructor() {
        this.apiKey = process.env.VAPI_API_KEY;
        this.assistantId = process.env.VAPI_ASSISTANT_ID;
        this.baseURL = 'https://api.vapi.ai';
        
        if (!this.apiKey) {
            console.warn('⚠️  VAPI_API_KEY not found in environment variables');
        }
        
        if (!this.assistantId) {
            console.warn('⚠️  VAPI_ASSISTANT_ID not found in environment variables');
        }
    }

    /**
     * Create a new phone call using Vapi
     * @param {string} phoneNumber - The phone number to call
     * @param {Object} options - Additional options for the call
     * @returns {Promise<Object>} - Call response data
     */
    async createCall(phoneNumber, options = {}) {
        if (!this.apiKey || !this.assistantId) {
            throw new Error('Vapi API key or Assistant ID not configured');
        }

        try {
            // Using the correct API endpoint and payload structure from official docs
            const callData = {
                assistantId: this.assistantId,
                customer: {
                    number: phoneNumber
                },
                phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID || "74252b39-1da6-4515-80b1-17c4a06919be"
            };

            // Add custom message if provided
            if (options.customMessage) {
                callData.assistantOverrides = {
                    firstMessage: options.customMessage
                };
            }

            console.log('Making Vapi call with payload:', JSON.stringify(callData, null, 2));

            const response = await axios.post(`${this.baseURL}/call`, callData, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                callId: response.data.id,
                status: response.data.status,
                message: 'Call initiated successfully with Vapi AI'
            };

        } catch (error) {
            console.error('Vapi API Error:', error.response?.data || error.message);
            throw new Error(`Failed to create Vapi call: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Get call status from Vapi
     * @param {string} callId - The call ID to check
     * @returns {Promise<Object>} - Call status data
     */
    async getCallStatus(callId) {
        if (!this.apiKey) {
            throw new Error('Vapi API key not configured');
        }

        try {
            const response = await axios.get(`${this.baseURL}/call/${callId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            return response.data;

        } catch (error) {
            console.error('Vapi API Error:', error.response?.data || error.message);
            throw new Error(`Failed to get call status: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * End a call using Vapi
     * @param {string} callId - The call ID to end
     * @returns {Promise<Object>} - End call response
     */
    async endCall(callId) {
        if (!this.apiKey) {
            throw new Error('Vapi API key not configured');
        }

        try {
            const response = await axios.post(`${this.baseURL}/call/${callId}/end`, {}, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            return response.data;

        } catch (error) {
            console.error('Vapi API Error:', error.response?.data || error.message);
            throw new Error(`Failed to end call: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Get available assistants
     * @returns {Promise<Array>} - List of assistants
     */
    async getAssistants() {
        if (!this.apiKey) {
            throw new Error('Vapi API key not configured');
        }

        try {
            const response = await axios.get(`${this.baseURL}/assistant`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            return response.data;

        } catch (error) {
            console.error('Vapi API Error:', error.response?.data || error.message);
            throw new Error(`Failed to get assistants: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Check if Vapi is properly configured
     * @returns {boolean} - Configuration status
     */
    isConfigured() {
        return !!(this.apiKey && this.assistantId);
    }

    /**
     * Get configuration status
     * @returns {Object} - Configuration details
     */
    getConfigStatus() {
        return {
            apiKey: !!this.apiKey,
            assistantId: !!this.assistantId,
            configured: this.isConfigured()
        };
    }
}

module.exports = VapiService;
