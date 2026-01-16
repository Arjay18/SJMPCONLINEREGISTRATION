import React, { useState, useEffect } from 'react';
import { uploadMembers, getRegistrations, getStats, exportRegistrations, getMembers } from '../services/api';
import { printCoupon } from '../utils/printer';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'registrations') {
      loadRegistrations();
    } else if (activeTab === 'members') {
      loadMembers();
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const response = await getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const response = await getRegistrations();
      setRegistrations(response.data.registrations);
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await getMembers();
      setMembers(response.data.members);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setUploadResult(null);
      } else {
        alert('Please select an Excel file (.xlsx or .xls)');
        e.target.value = '';
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadMembers(formData);
      setUploadResult(response.data);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.value = '';
      
      // Reload stats
      loadStats();
    } catch (error) {
      setUploadResult({ 
        success: false, 
        message: error.response?.data?.error || 'Upload failed' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportRegistrations();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registrations_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error exporting data');
      console.error('Export error:', error);
    }
  };

  const handleReprint = async (reg) => {
    try {
      const couponData = {
        organization: 'Your Organization Name',
        passbook_no: reg.passbook_no,
        full_name: reg.full_name,
        registration_date: new Date(reg.registration_date).toLocaleString()
      };
      await printCoupon(couponData);
    } catch (error) {
      alert('Print failed: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total_members}</div>
            <div className="stat-label">Total Members</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total_registered}</div>
            <div className="stat-label">Total Registered</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.today_registered}</div>
            <div className="stat-label">Today's Registrations</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      )}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Members
        </button>
        <button 
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Master List
        </button>
        <button 
          className={`tab ${activeTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          Registrations
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'upload' && (
          <div className="upload-section">
            <h3>Upload Excel Master List</h3>
            <p className="instructions">
              Excel file must contain columns: <strong>passbook_no</strong> and <strong>full_name</strong>
            </p>
            
            <form onSubmit={handleUpload} className="upload-form">
              <input 
                id="fileInput"
                type="file" 
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="file-input"
              />
              
              {file && (
                <div className="file-selected">
                  Selected: {file.name}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!file || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </form>

            {uploadResult && (
              <div className={`upload-result ${uploadResult.success ? 'success' : 'error'}`}>
                <h4>{uploadResult.success ? 'Upload Successful' : 'Upload Failed'}</h4>
                {uploadResult.success && (
                  <>
                    <p>Total records: {uploadResult.total}</p>
                    <p>Inserted/Updated: {uploadResult.inserted}</p>
                    <p>Skipped: {uploadResult.skipped}</p>
                  </>
                )}
                {!uploadResult.success && (
                  <p>{uploadResult.message}</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="members-section">
            <div className="section-header">
              <h3>Master List ({members.length} members)</h3>
            </div>
            
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Passbook No</th>
                      <th>Full Name</th>
                      <th>Added On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td>{member.passbook_no}</td>
                        <td>{member.full_name}</td>
                        <td>{formatDate(member.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {members.length === 0 && (
                  <div className="no-data">No members found. Upload an Excel file to add members.</div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="registrations-section">
            <div className="section-header">
              <h3>Registered Members ({registrations.length})</h3>
              <button 
                onClick={handleExport}
                className="btn btn-success"
                disabled={registrations.length === 0}
              >
                Export to Excel
              </button>
            </div>
            
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Passbook No</th>
                      <th>Full Name</th>
                      <th>Registration Date</th>
                      <th>Device Info</th>
                      <th>Reprint Coupon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>{reg.passbook_no}</td>
                        <td>{reg.full_name}</td>
                        <td>{formatDate(reg.registration_date)}</td>
                        <td className="device-info">{reg.device_info || 'N/A'}</td>
                        <td>
                          <button className="btn btn-primary" onClick={() => handleReprint(reg)}>
                            Reprint
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {registrations.length === 0 && (
                  <div className="no-data">No registrations yet.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
