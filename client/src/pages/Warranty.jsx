import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';
import SelectDropdown from '../components/SelectDropdown';
import { useAuth } from '../context/AuthContext';
import BuildIcon from '@mui/icons-material/Build';
import ShieldIcon from '@mui/icons-material/Shield';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import EmailIcon from '@mui/icons-material/Email';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ISSUE_OPTIONS = [
  { value: "System won't boot", label: "System won't boot" },
  { value: 'Overheating / Cooling Issue', label: 'Overheating / Cooling Issue' },
  { value: 'GPU / Display Issue', label: 'GPU / Display Issue' },
  { value: 'Physical Damage on Arrival', label: 'Physical Damage on Arrival' },
  { value: 'Missing Components', label: 'Missing Components' },
  { value: 'Other', label: 'Other' }
];

const Warranty = () => {
  const [formData, setFormData] = useState({
    orderId: '',
    issue: '',
    details: '',
    consent: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const submitClaim = useMutation({
    mutationFn: (data) => apiClient.post('/support', data),
    onSuccess: () => {
      setSubmitted(true);
      setErrorMsg('');
      setAttachments([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ orderId: '', issue: '', details: '', consent: false });
      }, 4000);
    },
    onError: (error) => {
      setErrorMsg(error.response?.data?.message || 'Failed to submit claim. Please try again.');
    }
  });

  const { isLoggedIn, user } = useAuth();
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const { data } = await apiClient.get('/orders');
      return data.data?.orders || [];
    },
    enabled: isLoggedIn
  });
  const deliveredOrders = (ordersData || []).filter((order) => order.orderStatus === 'delivered');
  const emailValue = isLoggedIn ? user?.email || '' : '';
  const showOrderDropdown = isLoggedIn && deliveredOrders.length > 0;
  const orderOptions = deliveredOrders.map((order) => ({
    value: order._id,
    label: `#${order.orderNumber || order._id} — ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.issue) {
      setErrorMsg('Please select the type of issue.');
      return;
    }
    if (showOrderDropdown && !formData.orderId) {
      setErrorMsg('Please select your delivered order.');
      return;
    }
    if (!formData.consent) {
      setErrorMsg('Please accept the terms to continue.');
      return;
    }
    
    // Check if orderId is valid object id, otherwise append it
    let finalOrder = undefined;
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(formData.orderId);
    if (isObjectId) {
      finalOrder = formData.orderId;
    }

    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
    const description = `Email: ${emailValue}\n${!isObjectId ? `Order ID: ${formData.orderId}\n` : ''}Details: ${formData.details}`;

    const payload = {
      issueType: 'warranty',
      subject: `Warranty Claim: ${formData.issue}`,
      description: description,
      order: finalOrder,
      name: fullName || emailValue.split('@')[0]
    };

    if (attachments.length > 0) {
      const formDataObj = new FormData();
      formDataObj.append('body', JSON.stringify(payload));
      attachments.forEach((file) => formDataObj.append('attachments', file));
      submitClaim.mutate(formDataObj);
    } else {
      submitClaim.mutate(payload);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
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
                    <p className="text-sm text-green-700 font-medium mb-4">Your request has been forwarded to our engineering team. We will contact you shortly.</p>
                    <Link to="/my-tickets" className="text-sm font-bold text-green-700 underline hover:text-green-900">Track your claim</Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">Order *</label>
                      {showOrderDropdown ? (
                        <SelectDropdown
                          value={formData.orderId}
                          onChange={(v) => setFormData({ ...formData, orderId: v })}
                          placeholder="Select your delivered order"
                          options={orderOptions}
                        />
                      ) : (
                        <>
                          {isLoggedIn && !ordersLoading && (
                            <p className="text-[12px] text-gray-500 font-medium mb-1.5">No delivered orders found. You can still enter your Order ID manually.</p>
                          )}
                          {!isLoggedIn && (
                            <p className="text-[12px] text-gray-500 font-medium mb-1.5">Log in to pick from your delivered orders.</p>
                          )}
                          <input
                            type="text"
                            name="orderId"
                            value={formData.orderId}
                            onChange={handleChange}
                            required
                            placeholder="e.g. ORD-123456"
                            className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500"
                          />
                        </>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">Email Address *</label>
                      {isLoggedIn ? (
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            value={emailValue}
                            readOnly
                            required
                            className="w-full bg-gray-100 text-gray-500 border border-gray-300 px-4 py-3 rounded-sm font-medium cursor-not-allowed select-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-green-700 uppercase tracking-wide bg-green-50 border border-green-200 px-2 py-0.5 rounded-sm">
                            Verified
                          </span>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <p className="text-[13px] text-blue-800 font-medium">Log in to file a warranty claim.</p>
                          <Link to="/login" className="shrink-0 bg-blue-600 text-white text-[12px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm hover:bg-blue-700 transition-colors">
                            Log In
                          </Link>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">Type of Issue *</label>
                      <SelectDropdown
                        value={formData.issue}
                        onChange={(v) => setFormData({ ...formData, issue: v })}
                        placeholder="Select the issue category"
                        options={ISSUE_OPTIONS}
                      />
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
                        className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500 resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">Attach Warranty Document (Optional)</label>
                      <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 text-[13px] font-bold text-gray-600 hover:text-blue-600 transition-colors uppercase tracking-wide border border-dashed border-gray-300 bg-gray-50 px-4 py-3 w-full">
                        <AttachFileIcon fontSize="small" />
                        Choose Files (max 5, up to 10MB each)
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setAttachments((prev) => [...prev, ...files].slice(0, 5));
                            e.target.value = '';
                          }}
                        />
                      </label>
                      {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {attachments.map((file, i) => (
                            <div key={i} className="relative flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2" style={{ borderRadius: 'var(--radius-sm)' }}>
                              {file.type.startsWith('image/') ? (
                                <img src={URL.createObjectURL(file)} alt={file.name} className="w-10 h-10 object-cover rounded-sm" />
                              ) : (
                                <AttachFileIcon fontSize="small" sx={{ color: '#2563EB' }} />
                              )}
                              <span className="text-[12px] text-gray-700 font-medium truncate max-w-[180px]">{file.name}</span>
                              <span className="text-[11px] text-gray-500">{formatBytes(file.size)}</span>
                              <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 font-bold text-sm leading-none ml-1">×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex items-center h-5 mt-0.5">
                        <input
                          id="consent"
                          name="consent"
                          type="checkbox"
                          checked={formData.consent}
                          onChange={handleChange}
                          required
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded-sm focus:ring-blue-500"
                        />
                      </div>
                      <label htmlFor="consent" className="text-[13px] text-gray-600 leading-relaxed font-medium">
                        I consent to RigCraft using my order details and contact information to process this warranty claim.
                        I agree to the <Link to="/terms-of-service" className="text-blue-600 hover:underline">Terms & Conditions</Link> and{' '}
                        <Link to="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                      </label>
                    </div>

                    {errorMsg && (
                      <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                        {errorMsg}
                      </div>
                    )}
                    <button 
                      type="submit" 
                      disabled={submitClaim.isPending || !isLoggedIn || !formData.consent}
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
