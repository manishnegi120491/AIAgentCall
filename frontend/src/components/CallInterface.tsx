import React, { useState } from 'react';

interface CallInterfaceProps {
  onCallStatusChange: (status: string) => void;
}

const CallInterface: React.FC<CallInterfaceProps> = ({ onCallStatusChange }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'loading' } | null>(null);
  const [mainProvider, setMainProvider] = useState<'vapi' | 'twilio' | ''>('');
  const [callProvider, setCallProvider] = useState<'vapi' | 'twilio-traditional-second' | 'twilio-traditional-first' | 'twilio-custom'>('vapi');
  const [customMessage, setCustomMessage] = useState<string>('Thank you for calling Wellness Partners. This is Riley, your scheduling assistant. How may I help you today?');
  const [vapiStatus, setVapiStatus] = useState<{ configured: boolean; message: string } | null>(null);

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 0 && !cleaned.startsWith('+')) {
      return '+' + cleaned;
    }
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleMainProviderChange = (provider: 'vapi' | 'twilio' | '') => {
    setMainProvider(provider);
    if (provider === 'vapi') {
      setCallProvider('vapi');
    } else if (provider === 'twilio') {
      setCallProvider('twilio-traditional-second');
    }
  };

  const showStatus = (message: string, type: 'success' | 'error' | 'loading') => {
    setStatus({ message, type });
    onCallStatusChange(message);
  };

  const hideStatus = () => {
    setStatus(null);
    onCallStatusChange('');
  };

  // Check Vapi status on component mount
  React.useEffect(() => {
    const checkVapiStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/vapi/status');
        const data = await response.json();
        setVapiStatus(data);
      } catch (error) {
        console.error('Failed to check Vapi status:', error);
      }
    };
    checkVapiStatus();
  }, []);

  const makeCall = async () => {
    if (!mainProvider) {
      showStatus('Please select an agent first', 'error');
      return;
    }

    if (!phoneNumber.trim()) {
      showStatus('Please enter a phone number', 'error');
      return;
    }

    if (!phoneNumber.startsWith('+')) {
      showStatus('Please enter a valid phone number with country code (e.g., +1234567890)', 'error');
      return;
    }

    try {
      setIsLoading(true);
      showStatus('Initiating call...', 'loading');

      const endpoint = mainProvider === 'vapi' ? 'http://localhost:5000/api/call/vapi' : 'http://localhost:5000/api/call';
      
      // Determine music type and custom message based on provider
      let musicType = 'traditional-second';
      let customIntro = '';
      if (mainProvider === 'twilio') {
        if (callProvider === 'twilio-traditional-first') {
          musicType = 'traditional-first';
        } else if (callProvider === 'twilio-traditional-second') {
          musicType = 'traditional-second';
        } else if (callProvider === 'twilio-custom') {
          musicType = 'custom';
          customIntro = customMessage;
        }
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber,
          ...(mainProvider === 'twilio' && { musicType }),
          ...(mainProvider === 'vapi' && { customMessage }),
          ...(callProvider === 'twilio-custom' && { customMessage: customIntro })
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const callId = data.callSid || data.callId;
        const provider = data.provider || callProvider;
        const musicInfo = data.musicType ? ` (Music: ${data.musicType === 'traditional-first' ? 'Vande Mataram' : data.musicType === 'custom' ? 'Custom Message' : 'Mafia - 51 Glorious Days'})` : '';
        showStatus(`${mainProvider === 'vapi' ? 'AI' : 'Twilio'} call initiated successfully! Call ID: ${callId}${musicInfo}`, 'success');
      } else {
        showStatus(`Error: ${data.error}`, 'error');
      }
    } catch (error) {
      showStatus(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      
      <div className="main-provider-selection">
        <h3>Agent:</h3>
        <div className="main-provider-dropdown">
          <select
            value={mainProvider}
            onChange={(e) => handleMainProviderChange(e.target.value as 'vapi' | 'twilio' | '')}
            className="provider-select"
            disabled={isLoading}
          >
            <option value="">Select an agent...</option>
            <option value="vapi">🤖 Vapi AI (with Background Music)</option>
            <option value="twilio">📞 Twilio</option>
          </select>
        </div>
        {vapiStatus && mainProvider === 'vapi' && (
          <div className={`vapi-status ${vapiStatus.configured ? 'configured' : 'not-configured'}`}>
            {vapiStatus.configured ? '✅ Vapi AI Ready' : '⚠️ Vapi AI Not Configured'}
          </div>
        )}
      </div>

      {mainProvider === 'vapi' && (
        <div className="vapi-options">
          <h3>Vapi AI Options:</h3>
          <div className="custom-message-section">
            <h4>Custom Introduction Message:</h4>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="custom-message-input"
              placeholder="Enter your custom introduction message..."
              rows={3}
              disabled={isLoading}
            />
            <p className="custom-message-hint">
              This message will be played when the call is answered.
            </p>
          </div>
        </div>
      )}

      {mainProvider === 'twilio' && (
        <div className="twilio-options">
          <h3>Twilio Options:</h3>
          <div className="provider-options">
            <label className={`provider-option ${callProvider === 'twilio-traditional-second' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="twilio-provider"
                value="twilio-traditional-second"
                checked={callProvider === 'twilio-traditional-second'}
                onChange={(e) => setCallProvider(e.target.value as 'twilio-traditional-second')}
                disabled={isLoading}
              />
              <span className="provider-label">
                📞 Twilio Traditional First Background
              </span>
            </label>
            <label className={`provider-option ${callProvider === 'twilio-traditional-first' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="twilio-provider"
                value="twilio-traditional-first"
                checked={callProvider === 'twilio-traditional-first'}
                onChange={(e) => setCallProvider(e.target.value as 'twilio-traditional-first')}
                disabled={isLoading}
              />
              <span className="provider-label">
                📞 Twilio Traditional Second Background
              </span>
            </label>
            <label className={`provider-option ${callProvider === 'twilio-custom' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="twilio-provider"
                value="twilio-custom"
                checked={callProvider === 'twilio-custom'}
                onChange={(e) => setCallProvider(e.target.value as 'twilio-custom')}
                disabled={isLoading}
              />
              <span className="provider-label">
                📞 Custom Prompt
              </span>
            </label>
          </div>
        </div>
      )}

      {callProvider === 'twilio-custom' && (
        <div className="custom-message-section">
          <h3>Custom Introduction Message:</h3>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="custom-message-input"
            placeholder="Enter your custom introduction message..."
            rows={3}
            disabled={isLoading}
          />
          <p className="custom-message-hint">
            This message will be played when the call is answered.
          </p>
        </div>
      )}

      <div className="input-group">
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          className="phone-input"
          placeholder="Enter phone number (e.g., +1234567890)"
          maxLength={20}
          disabled={isLoading}
        />
      </div>
      
      <button
        onClick={makeCall}
        className="call-button"
        disabled={isLoading || !mainProvider}
      >
        {isLoading && <span className="loading-spinner"></span>}
        {isLoading ? 'Calling...' : !mainProvider ? 'Select an agent first' : 'Make Call'}
      </button>
      
      {status && (
        <div className={`status ${status.type}`}>
          {status.message}
        </div>
      )}

    </div>
  );
};

export default CallInterface;
