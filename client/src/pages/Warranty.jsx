import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';
import BuildIcon from '@mui/icons-material/Build';
import ShieldIcon from '@mui/icons-material/Shield';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import EmailIcon from '@mui/icons-material/Email';

const Warranty = () => {
  const [formData, setFormData] = useState({
    orderId: '',
    email: '',
    issue: '',
    details: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const submitClaim = useMutation({
    mutationFn: (data) => apiClient.post('/support', data),
    onSuccess: () => {
      setSubmitted(true);
      setErrorMsg('');
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ orderId: '', email: '', issue: '', details: '' });
      }, 4000);
    },
    onError: (error) => {
      setErrorMsg(error.response?.data?.message || 'Failed to submit claim. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if orderId is valid object id, otherwise append it
    let finalOrder = undefined;
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(formData.orderId);
    if (isObjectId) {
      finalOrder = formData.orderId;
    }

    const description = `Email: ${formData.email}\n${!isObjectId ? `Order ID: ${formData.orderId}\n` : ''}Details: ${formData.details}`;

    submitClaim.mutate({
      issueType: 'warranty',
      subject: `Warranty Claim: ${formData.issue}`,
      description: description,
      order: finalOrder,
      name: formData.email.split('@')[0]
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Warranty' }]} />
        <FadeUp>
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight uppercase">
              Warranty <span className="text-blue-600">Claims</span>
            </h1>
            <p className="text-[16px] text-gray-600 font-medium max-w-2xl mx-auto">
              We stand by the quality of our builds and components. If something goes wrong, we're here to make it right. Review our policy or submit a claim below.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left: Info & Policy */}
            <div className="lg:w-1/2 flex flex-col gap-8">
              
              <div className="bg-white p-8 border border-gray-200 shadow-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
                <div className="flex items-center gap-4 mb-4">
                  <ShieldIcon sx={{ fontSize: 32, color: '#2563EB' }} />
                  <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Our Guarantee</h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-medium mb-4">
                  Every custom PC built by RigCraft comes with a standard <strong>3-Year Parts and Labor Warranty</strong>. Individual components purchased separately carry their respective manufacturer warranties.
                </p>
                <ul className="text-sm text-gray-600 flex flex-col gap-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Free diagnosis and labor for system defects within 3 years.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Lifetime free technical phone and email support.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Advance RMA available for critical components (subject to approval).
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 border border-gray-200 shadow-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
                <div className="flex items-center gap-4 mb-4">
                  <AssignmentReturnIcon sx={{ fontSize: 32, color: '#2563EB' }} />
                  <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Claim Process</h2>
                </div>
                <div className="flex flex-col gap-6 relative">
                  {/* Line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-blue-100"></div>
                  
                  <div className="flex gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div>
                      <h3 className="text-[15px] font-bold text-gray-900 mb-1">Submit Request</h3>
                      <p className="text-[13px] text-gray-600 font-medium">Fill out the claim form with your Order ID and issue details.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div>
                      <h3 className="text-[15px] font-bold text-gray-900 mb-1">Diagnosis</h3>
                      <p className="text-[13px] text-gray-600 font-medium">Our engineers will review and may contact you for remote troubleshooting.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div>
                      <h3 className="text-[15px] font-bold text-gray-900 mb-1">Return / Replacement</h3>
                      <p className="text-[13px] text-gray-600 font-medium">If hardware failure is confirmed, we will issue an RMA number for return or advance replacement.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Claim Form */}
            <div className="lg:w-1/2">
              <div className="bg-white p-8 md:p-10 border border-gray-200 shadow-xl relative overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
                {/* Decorative header */}
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                
                <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase">File a Claim</h2>
                <p className="text-sm text-gray-500 font-medium mb-8">Please provide your details below. Our support team responds within 24 hours.</p>

                {submitted ? (
                  <div className="bg-green-50 border border-green-200 p-6 rounded-md flex flex-col items-center text-center">
                    <EmailIcon sx={{ fontSize: 48, color: '#16A34A' }} className="mb-4" />
                    <h3 className="text-lg font-bold text-green-800 mb-2">Claim Submitted Successfully!</h3>
                    <p className="text-sm text-green-700 font-medium">Your request has been forwarded to our engineering team. We will contact you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">Order ID *</label>
                      <input 
                        type="text" 
                        name="orderId"
                        value={formData.orderId}
                        onChange={handleChange}
                        required
                        placeholder="e.g. ORD-123456"
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">Email Address *</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Your registered email"
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">Type of Issue *</label>
                      <select 
                        name="issue"
                        value={formData.issue}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
                      >
                        <option value="" disabled>Select the issue category</option>
                        <option value="System won't boot">System won't boot</option>
                        <option value="Overheating / Cooling Issue">Overheating / Cooling Issue</option>
                        <option value="GPU / Display Issue">GPU / Display Issue</option>
                        <option value="Physical Damage on Arrival">Physical Damage on Arrival</option>
                        <option value="Missing Components">Missing Components</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">Detailed Description *</label>
                      <textarea 
                        name="details"
                        value={formData.details}
                        onChange={handleChange}
                        required
                        rows="4"
                        placeholder="Please describe the problem you are experiencing in detail..."
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none resize-none"
                      ></textarea>
                    </div>

                    {errorMsg && (
                      <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                        {errorMsg}
                      </div>
                    )}
                    <button 
                      type="submit" 
                      disabled={submitClaim.isPending}
                      className="w-full bg-blue-600 text-white font-bold uppercase tracking-widest text-[14px] py-3.5 rounded-sm hover:bg-blue-700 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <BuildIcon fontSize="small" /> {submitClaim.isPending ? 'Submitting...' : 'Submit Claim'}
                    </button>
                    
                  </form>
                )}
                
              </div>
            </div>

          </div>
        </FadeUp>
      </div>
    </div>
  );
};

export default Warranty;
