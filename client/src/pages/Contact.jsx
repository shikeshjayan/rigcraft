import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import apiClient from '../api/client'
import { useAuth } from '../context/AuthContext'
import SelectDropdown from '../components/SelectDropdown'
import { REASON_OPTIONS, normalizeReasonType } from '../utils/supportLabels'
import { getPublicSettings } from '../services/settings.service'

const formatBytes = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const inputClass =
  'w-full px-4 py-3 border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400'

const Contact = () => {
  const { isLoggedIn, user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    reason: normalizeReasonType(searchParams.get('type')),
    order: '',
    subject: '',
    message: '',
    consent: false,
    cancelOrder: false
  })
  const [attachments, setAttachments] = useState([])
  const fileInputRef = useRef(null)
  const [showPopup, setShowPopup] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const emailValue = isLoggedIn ? user?.email || '' : ''

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['contactOrders'],
    queryFn: async () => {
      const { data } = await apiClient.get('/orders')
      return data.data?.orders || []
    },
    enabled: isLoggedIn
  })
  const orders = ordersData || []
  const orderOptions = [
    { value: '', label: 'No order' },
    ...orders.map((order) => ({
      value: order._id,
      label: `#${order.orderNumber || order._id} — ${order.orderStatus}`
    }))
  ]

  const { data: settings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: getPublicSettings,
    staleTime: 300000
  })
  const general = settings?.general || {}
  const contact = settings?.contact || {}
  const storeName = general.storeName || 'RigCraft'
  const address = contact.address || 'Technopark Phase III, Kazhakkoottam, Trivandrum, Kerala 695581, India'
  const phone = contact.phone || '+91 98765 43210'
  const email = contact.email || 'support@rigcraft.com'

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setErrorMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!isLoggedIn) return
    if (!formData.reason) {
      setErrorMsg('Please select a reason so we can route your request correctly.')
      return
    }
    if (!formData.message) {
      setErrorMsg('Please describe how we can help.')
      return
    }
    if (!formData.consent) {
      setErrorMsg('Please agree to the Terms & Conditions and Privacy Policy to continue.')
      return
    }
    try {
      setIsSubmitting(true)
      const payload = {
        name: fullName || emailValue.split('@')[0],
        subject: formData.subject || `Support request (${formData.reason})`,
        issueType: formData.reason,
        description: `Name: ${fullName}\nEmail: ${emailValue}\n\nMessage:\n${formData.message}`,
        order: formData.order || undefined,
        cancelOrder: formData.cancelOrder || undefined
      }

      let res
      if (attachments.length > 0) {
        const formDataObj = new FormData()
        formDataObj.append('body', JSON.stringify(payload))
        attachments.forEach((file) => formDataObj.append('attachments', file))
        res = await apiClient.post('/support', formDataObj)
      } else {
        res = await apiClient.post('/support', payload)
      }

      if (res.data.success) {
        setShowPopup(true)
        setAttachments([])
        if (fileInputRef.current) fileInputRef.current.value = ''
        setFormData({ reason: '', order: '', subject: '', message: '', consent: false, cancelOrder: false })
        setTimeout(() => setShowPopup(false), 3000)
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to send message. Please ensure you are logged in to raise a support ticket.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative bg-[#09090b] py-24 md:py-32 overflow-hidden border-b border-white/5">
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
              We're here to help at every step of your journey — before you buy, while we build, and long after delivery.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/3 flex flex-col gap-10"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Questions before you buy, about an order or payment, shipping, warranty, or a return?
                Pick the reason that fits and we'll route your request to the right team.
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
                  <h3 className="font-bold text-gray-900 mb-1">{storeName} Headquarters</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {address}
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
                  <p className="text-gray-600 text-sm">{phone}</p>
                  {contact.whatsapp && contact.whatsapp !== phone && (
                    <p className="text-gray-500 text-xs mt-1">WhatsApp: {contact.whatsapp}</p>
                  )}
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
                  <p className="text-[var(--color-primary)] text-sm font-medium">{email}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-2/3"
          >
            <div className="bg-white p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100" style={{ borderRadius: 'var(--radius-sm, 8px)' }}>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Raise a Support Ticket</h3>
              <p className="text-sm text-gray-500 mb-6">
                Looking for quick answers? Visit the{' '}
                <Link to="/help" className="text-[var(--color-primary)] font-semibold hover:underline">Help Center</Link>.
              </p>

              {!isLoggedIn ? (
                <div className="bg-blue-50 border border-blue-200 px-5 py-5 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-[15px] font-bold text-blue-900 mb-1">Log in to raise a support ticket</h4>
                    <p className="text-[13px] text-blue-700 font-medium">We use your account details and order history to help you faster.</p>
                  </div>
                  <Link
                    to="/login"
                    className="shrink-0 bg-blue-600 text-white text-[13px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-sm hover:bg-blue-700 transition-colors text-center"
                  >
                    Log In
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                  <div>
                    <label htmlFor="reason" className="text-sm font-semibold text-gray-700 block mb-1.5">What do you need help with?</label>
                    <SelectDropdown
                      value={formData.reason}
                      onChange={(v) => setFormData({ ...formData, reason: v })}
                      placeholder="Select a reason"
                      options={REASON_OPTIONS}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="text-sm font-semibold text-gray-700 block mb-1.5">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={fullName}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-200 bg-gray-100 text-gray-500 outline-none cursor-not-allowed select-none"
                        style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-semibold text-gray-700 block mb-1.5">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={emailValue}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-200 bg-gray-100 text-gray-500 outline-none cursor-not-allowed select-none pr-20"
                          style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-green-700 uppercase tracking-wide bg-green-50 border border-green-200 px-2 py-0.5 rounded-sm">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="order" className="text-sm font-semibold text-gray-700 block mb-1.5">Related Order (Optional)</label>
                    {ordersLoading ? (
                      <div className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-500" style={{ borderRadius: 'var(--radius-sm, 8px)' }}>Loading your orders...</div>
                    ) : orders.length > 0 ? (
                      <SelectDropdown
                        value={formData.order}
                        onChange={(v) => setFormData({ ...formData, order: v })}
                        placeholder="Select an order"
                        options={orderOptions}
                      />
                    ) : (
                      <div className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-500" style={{ borderRadius: 'var(--radius-sm, 8px)' }}>No orders yet — you can still send us a message.</div>
                    )}
                  </div>

                  {formData.reason === 'order' && formData.order && (
                    <div className="flex items-start gap-3">
                      <div className="flex items-center h-5 mt-0.5">
                        <input
                          id="cancelOrder"
                          name="cancelOrder"
                          type="checkbox"
                          checked={formData.cancelOrder}
                          onChange={handleChange}
                          className="w-4 h-4 text-[var(--color-primary)] bg-gray-100 border-gray-300 focus:ring-[var(--color-primary)]"
                          style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                        />
                      </div>
                      <label htmlFor="cancelOrder" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                        I want to <span className="font-semibold text-gray-900">cancel this order</span>. Our team will review the request. Refunds for paid orders are processed automatically when cancellation is possible.
                      </label>
                    </div>
                  )}

                  <div>
                    <label htmlFor="subject" className="text-sm font-semibold text-gray-700 block mb-1.5">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Enter the subject"
                      className={inputClass}
                      style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="text-sm font-semibold text-gray-700 block mb-1.5">How can we help?</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Enter your message here..."
                      rows="5"
                      className={`${inputClass} resize-none`}
                      style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                    ></textarea>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Attachments (Optional)</label>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 text-[13px] font-bold text-gray-600 hover:text-blue-600 transition-colors uppercase tracking-wide border border-dashed border-gray-300 bg-gray-50 px-4 py-3 w-full" style={{ borderRadius: 'var(--radius-sm, 8px)' }}>
                      <AttachFileIcon fontSize="small" />
                      Choose Files (max 5, up to 10MB each)
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          setAttachments((prev) => [...prev, ...files].slice(0, 5))
                          e.target.value = ''
                        }}
                      />
                    </label>
                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {attachments.map((file, i) => (
                          <div key={i} className="relative flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2" style={{ borderRadius: 'var(--radius-sm, 8px)' }}>
                            {file.type.startsWith('image/') ? (
                              <img src={URL.createObjectURL(file)} alt={file.name} className="w-10 h-10 object-cover rounded-sm" />
                            ) : (
                              <AttachFileIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                            )}
                            <span className="text-[12px] text-gray-700 font-medium truncate max-w-[180px]">{file.name}</span>
                            <span className="text-[11px] text-gray-500">{formatBytes(file.size)}</span>
                            <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 font-bold text-sm leading-none ml-1">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 mt-1">
                    <div className="flex items-center h-5 mt-0.5">
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
                      I consent to having RigCraft collect my name, email and order details to process this request.
                      I agree to the <Link to="/terms-of-service" className="text-[var(--color-primary)] hover:underline">Terms & Conditions</Link> and <Link to="/privacy-policy" className="text-[var(--color-primary)] hover:underline">Privacy Policy</Link>.
                    </label>
                  </div>

                  {errorMsg && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                      {errorMsg}
                    </div>
                  )}

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
                    {isSubmitting ? 'Sending...' : 'Raise Ticket'}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>

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
              <Link to="/my-tickets" className="text-[var(--color-primary)] text-sm font-bold hover:underline mt-2 inline-block">Track your ticket</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Contact
