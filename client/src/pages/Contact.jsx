import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    consent: false
  });
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoggedIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("Please login to raise a support ticket or get in touch.");
      return;
    }
    
    if (formData.name && formData.email && formData.subject && formData.message && formData.consent) {
      try {
        setIsSubmitting(true);
        const res = await apiClient.post('/support', {
          name: formData.name,
          subject: formData.subject,
          issueType: 'other',
          description: `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
        });
        
        if (res.data.success) {
          setShowPopup(true);
          setFormData({ name: '', email: '', subject: '', message: '', consent: false });
          setTimeout(() => setShowPopup(false), 3000);
        }
      } catch (error) {
        alert(error.response?.data?.message || "Failed to send message. Please ensure you are logged in to raise a support ticket.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert("Please fill all fields and agree to the terms.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative bg-[#09090b] py-24 md:py-32 overflow-hidden border-b border-white/5">
        {/* Modern Background Accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-primary)]/20 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-6">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-cyan-300">Touch</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
              We're here to help you build your dream setup. Reach out to our expert team for support, inquiries, or just to talk tech.
            </p>

          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Column: Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/3 flex flex-col gap-10"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Have questions about our premium builds, custom PCs, or need technical support? 
                Our team of experts is ready to help you elevate your gaming experience.
              </p>
            </div>

            <div className="flex flex-col gap-8">
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-start gap-4 p-6 bg-white shadow-sm border border-gray-100"
                style={{ borderRadius: 'var(--radius-sm, 8px)' }}
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                  <LocationOnIcon />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">RigCraft Headquarters</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Technopark Phase III, <br/>
                    Kazhakkoottam, <br/>
                    Trivandrum, Kerala 695581, <br/>
                    India
                  </p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-start gap-4 p-6 bg-white shadow-sm border border-gray-100"
                style={{ borderRadius: 'var(--radius-sm, 8px)' }}
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                  <PhoneIcon />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Phone Number</h3>
                  <p className="text-gray-600 text-sm">+91 98765 43210</p>
                  <p className="text-gray-500 text-xs mt-1">Mon-Fri 9am-6pm IST</p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-start gap-4 p-6 bg-white shadow-sm border border-gray-100"
                style={{ borderRadius: 'var(--radius-sm, 8px)' }}
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                  <EmailIcon />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Email Address</h3>
                  <p className="text-[var(--color-primary)] text-sm font-medium">support@rigcraft.com</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-2/3"
          >
            <div className="bg-white p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100" style={{ borderRadius: 'var(--radius-sm, 8px)' }}>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Send us a Message</h3>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your Full Name"
                    className="w-full px-4 py-3 border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                    style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your Email Address"
                    className="w-full px-4 py-3 border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                    style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="text-sm font-semibold text-gray-700">Subject</label>
                  <input 
                    type="text" 
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Enter the subject"
                    className="w-full px-4 py-3 border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                    style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-sm font-semibold text-gray-700">How can we help?</label>
                  <textarea 
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Enter your message here..."
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all bg-gray-50 focus:bg-white resize-none text-gray-900 placeholder-gray-400"
                    style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                  ></textarea>
                </div>

                <div className="flex items-start gap-3 mt-2">
                  <div className="flex items-center h-5 mt-1">
                    <input 
                      id="consent" 
                      name="consent" 
                      type="checkbox"
                      checked={formData.consent}
                      onChange={handleChange}
                      required
                      className="w-4 h-4 text-[var(--color-primary)] bg-gray-100 border-gray-300 focus:ring-[var(--color-primary)]"
                      style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                    />
                  </div>
                  <label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed">
                    I consent to having RigCraft collect my name and email. 
                    I agree to the <a href="#" className="text-[var(--color-primary)] hover:underline">Terms & Conditions</a> and <a href="#" className="text-[var(--color-primary)] hover:underline">Privacy Policy</a>.
                  </label>
                </div>

                <motion.button
                  whileHover={formData.consent && !isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={formData.consent && !isSubmitting ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={!formData.consent || isSubmitting}
                  style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                  className={`mt-4 w-full font-bold py-4 transition-all flex items-center justify-center gap-2 ${
                    formData.consent && !isSubmitting
                      ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30 hover:brightness-110 cursor-pointer' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Connect with Support'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 right-10 z-50 bg-white border border-gray-100 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex items-start gap-4 max-w-md"
            style={{ borderRadius: 'var(--radius-sm, 8px)' }}
          >
            <div className="text-green-500 mt-1">
              <CheckCircleIcon fontSize="large" />
            </div>
            <div>
              <h4 className="text-gray-900 font-bold text-lg">Ticket Raised Successfully!</h4>
              <p className="text-gray-600 mt-1 text-sm">Your ticket has been raised and our team will shortly connect with you.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;
