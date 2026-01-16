import React, { useState } from 'react';
import { validatePassbook, registerMember } from '../services/api';
import { printCoupon } from '../utils/printer';
import './RegistrationForm.css';

function RegistrationForm() {
  const [passbookNo, setPassbookNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [validated, setValidated] = useState(false);

  const handleValidate = async (e) => {
    e.preventDefault();
    
    if (!passbookNo.trim()) {
      setMessage({ type: 'error', text: 'Please enter passbook number' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setMemberData(null);
    setValidated(false);

    try {
      const response = await validatePassbook(passbookNo.trim());
      
      if (response.data.valid) {
        setMemberData(response.data.member);
        setValidated(true);
        setMessage({ type: 'success', text: 'Valid passbook number. Click Register to continue.' });
      } else if (response.data.already_registered) {
        setMessage({ type: 'warning', text: 'Already Registered' });
        setMemberData(response.data.registration);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Invalid Passbook Number' });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setMessage({ type: 'error', text: 'Invalid Passbook Number' });
      } else if (error.response?.data?.already_registered) {
        setMessage({ type: 'warning', text: 'Already Registered' });
      } else {
        setMessage({ type: 'error', text: 'Error validating passbook number' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validated || !memberData) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const deviceInfo = `${navigator.userAgent.substring(0, 100)}`;
      const response = await registerMember(passbookNo.trim(), deviceInfo);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Registration Successful!' });
        
        // Prepare coupon data
        const couponData = {
          organization: 'Your Organization Name',
          passbook_no: response.data.registration.passbook_no,
          full_name: response.data.registration.full_name,
          registration_date: new Date(response.data.registration.registration_date).toLocaleString()
        };
        
        // Print coupon
        try {
          await printCoupon(couponData);
        } catch (printError) {
          console.error('Print error:', printError);
          setMessage({ 
            type: 'success', 
            text: 'Registration Successful! (Print failed - please check printer connection)' 
          });
        }
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setPassbookNo('');
          setMemberData(null);
          setValidated(false);
          setMessage(null);
        }, 3000);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setMessage({ type: 'warning', text: 'Already Registered' });
      } else {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Registration failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPassbookNo('');
    setMessage(null);
    setMemberData(null);
    setValidated(false);
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h2 className="registration-title">Member Registration</h2>
        
        <form onSubmit={handleValidate} className="registration-form">
          <div className="form-group">
            <label htmlFor="passbookNo" className="form-label">
              Passbook Number
            </label>
            <input
              id="passbookNo"
              type="text"
              value={passbookNo}
              onChange={(e) => setPassbookNo(e.target.value)}
              placeholder="Enter passbook number"
              className="form-input"
              disabled={loading || validated}
              autoFocus
            />
          </div>

          {message && (
            <div className={`message message-${message.type}`}>
              {message.text}
            </div>
          )}

          {memberData && validated && (
            <div className="member-info">
              <h3>Member Details</h3>
              <p><strong>Passbook No:</strong> {memberData.passbook_no}</p>
              <p><strong>Name:</strong> {memberData.full_name}</p>
            </div>
          )}

          <div className="button-group">
            {!validated ? (
              <>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || !passbookNo.trim()}
                >
                  {loading ? 'Validating...' : 'Validate'}
                </button>
                <button 
                  type="button" 
                  onClick={handleReset}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Clear
                </button>
              </>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={handleRegister}
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
                <button 
                  type="button" 
                  onClick={handleReset}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegistrationForm;
