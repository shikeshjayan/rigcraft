import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy'; // Fallback icon
import apiClient from '../api/client';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const mapCategoryToEnum = (cat) => {
  if (!cat) return 'accessory';
  const c = cat.toLowerCase();
  if (c.includes('processor') || c.includes('cpu')) return 'cpu';
  if (c.includes('motherboard')) return 'motherboard';
  if (c.includes('graphic') || c.includes('gpu')) return 'gpu';
  if (c.includes('memory') || c.includes('ram')) return 'ram';
  if (c.includes('storage') || c.includes('ssd') || c.includes('hdd') || c.includes('drive')) return 'storage';
  if (c.includes('power') || c.includes('psu')) return 'psu';
  if (c.includes('case') || c.includes('cabinet')) return 'cabinet';
  if (c.includes('cool')) return 'cooler';
  if (c.includes('os') || c.includes('operating')) return 'operatingSystem';
  return 'accessory';
};

const Chatbot = () => {
  const { user, isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('rigcraft_chat');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(() => {
    const saved = localStorage.getItem('rigcraft_chat');
    return saved ? JSON.parse(saved).length > 0 : false;
  });
  const [catalogData, setCatalogData] = useState(null);
  const [activeBuildParts, setActiveBuildParts] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  
  const idleTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const customerName = isLoggedIn && user ? (user.firstName || user.name || 'Customer') : 'there';

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('rigcraft_chat', JSON.stringify(messages));
    }
  }, [messages]);

  // Clear messages when user logs out (transition from true to false)
  const prevIsLoggedIn = useRef(isLoggedIn);
  useEffect(() => {
    if (prevIsLoggedIn.current === true && isLoggedIn === false) {
      setMessages([]);
      setHasGreeted(false);
      localStorage.removeItem('rigcraft_chat');
    }
    prevIsLoggedIn.current = isLoggedIn;
  }, [isLoggedIn]);

  // Fetch catalog data when chat is opened
  useEffect(() => {
    if (isOpen && !catalogData) {
      const fetchCatalog = async () => {
        try {
          const [productsRes, prebuiltsRes] = await Promise.all([
            apiClient.get('/products'),
            apiClient.get('/prebuilt-pcs')
          ]);
          
          // Extract array from paginated response (docs) or direct array
          const productsArray = productsRes.data?.data?.docs || productsRes.data?.data || [];
          const prebuiltsArray = prebuiltsRes.data?.data?.docs || prebuiltsRes.data?.data || [];
          
          // Map to minimize tokens
          const products = productsArray.map(p => {
            return {
              id: p._id,
              type: 'product',
              name: p.name,
              category: p.category?.name || 'Unknown',
              price: p.price,
              stock: p.stock > 0 ? 'In Stock' : 'Out of Stock',
              specs: p.specs,
              slug: p.slug,
              image: p.images?.[0]?.url || p.images?.[0] || ''
            };
          });
          
          const prebuilts = prebuiltsArray.map(p => {
            return {
              id: p._id,
              type: 'prebuilt',
              name: p.name,
              price: p.price,
              category: p.category?.name || 'Prebuilt',
              stock: p.stock > 0 ? 'In Stock' : 'Out of Stock',
              image: p.images?.[0]?.url || p.images?.[0] || ''
            };
          });

          setCatalogData({ products, prebuilts });
        } catch (error) {
          console.error("Failed to fetch catalog for AI", error);
          setCatalogData({ products: [], prebuilts: [] });
        }
      };
      fetchCatalog();
    }
  }, [isOpen, catalogData]);

  // Handle Initial Greeting and Idle Timer
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      setIsTyping(true);
      
      // Simulate 1-2s typing for the first greeting
      setTimeout(() => {
        setIsTyping(false);
        setMessages([
          { 
            role: 'ai', 
            text: `👋 Hi **${customerName}**! I'm RigCraft, your AI Assistant.\nI can help you build or find the perfect PC, check compatibility, compare components, and answer any PC-related questions.\n\nWhat would you like to build today?` 
          }
        ]);
        startIdleTimer();
      }, 1500);
    }
  }, [isOpen, hasGreeted, customerName]);

  // Handle external 'open-rig-ai' trigger from PC Builder Page
  useEffect(() => {
    const handleRigAiEvent = () => {
      setIsOpen(true);
      setHasGreeted(true); // Skip default greeting
      
      // Validate Catalog has all required parts
      const requiredCategories = ['cpu', 'motherboard', 'gpu', 'ram', 'storage', 'psu', 'cabinet', 'cooler'];
      const availableEnums = new Set(
        catalogData?.products?.map(p => mapCategoryToEnum(p.category)) || []
      );
      
      const missingCategories = requiredCategories.filter(c => !availableEnums.has(c));
      
      if (missingCategories.length > 0) {
        setIsTyping(true);
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { 
            role: 'ai', 
            text: `**Rig AI Assistant Initiated.**\n\nI apologize, but we are currently out of stock for some essential PC components (missing: ${missingCategories.join(', ')}). I cannot guide you through a complete custom build at this moment.\n\nPlease check back later when our inventory is restocked!` 
          }]);
        }, 3000);
        return; // Stop build flow
      }

      setIsBuilding(true);
      setActiveBuildParts([]);
      
      // Show 3 second typing animation before sending professional AI message
      setIsTyping(true);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: `**Rig AI Assistant Initiated.**\n\nI am ready to guide you through building your custom PC.\nTo get started, please tell me your **primary use case** (e.g., 4K Gaming, Video Editing, Software Development) and your **target budget**.` 
        }]);
        startIdleTimer();
      }, 3000);
    };

    window.addEventListener('open-rig-ai', handleRigAiEvent);
    return () => window.removeEventListener('open-rig-ai', handleRigAiEvent);
  }, [catalogData]);

  const handleSelectComponent = async (product) => {
    const updatedParts = [...activeBuildParts, { type: product.category, product }];
    setActiveBuildParts(updatedParts);
    
    // Add user message to show selection in chat
    setMessages(prev => [...prev, { role: 'user', text: `I selected the ${product.name} for my ${product.category}.` }]);
    
    setIsTyping(true);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    
    const hiddenPrompt = `SYSTEM: The user just selected ${product.name} as their ${product.category}. 
Please respond by confirming their selection with EXACTLY THIS FORMAT: 
"Your selected specs for the ${product.category} is:
- **Name**: ${product.name}
- **Price**: ₹${product.price}
- **Details**: ${product.specs || 'N/A'}"
Then recommend the next component category needed to build a PC (following the strict order: CPU -> Motherboard -> RAM -> GPU -> Storage -> Power Supply -> Cabinet -> Cooling).

CRITICAL BUDGET INSTRUCTION: You MUST calculate the total cost of all currently selected parts (${activeBuildParts.reduce((s,p) => s + (p.product.price || 0), 0) + product.price}). If the user previously mentioned a budget, subtract this total from their budget to find the REMAINING BUDGET. You MUST ONLY suggest the next component such that its price leaves enough budget for the rest of the unselected components.

If all 8 basic parts are selected, list all the selected components with their prices and the total sum, then output exactly [BUILD_COMPLETE].`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const promptText = `You are RigCraft, an AI PC Builder Assistant. 
      
Here is the live catalog:
${JSON.stringify(catalogData)}

Active Build State: User is building a PC
Selected Parts: ${JSON.stringify(updatedParts)}

INSTRUCTIONS:
1. Guide the user step-by-step: CPU -> Motherboard -> RAM -> GPU -> Storage -> Power Supply -> Cabinet -> Cooling.
2. Only recommend products from the catalog. Use exact prices. 
3. CRITICAL INSTRUCTION: When suggesting a product from the catalog, you MUST append its exact ID in brackets like this: [PRODUCT_CARD: id]. Example: "I recommend the RTX 4090. [PRODUCT_CARD: 64a1b2c...]"
4. Wait for the user to select a component (via UI button) before recommending the next category.
5. If all 8 parts are selected, output exactly [BUILD_COMPLETE].

User: ${hiddenPrompt}`;
      
      const result = await model.generateContent(promptText);
      setMessages(prev => [...prev, { role: 'ai', text: result.response.text() }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "Error fetching next part. Please try again." }]);
    } finally {
      setIsTyping(false);
      startIdleTimer();
    }
  };



  const handleSaveBuild = async () => {
    try {
      const payload = {
        name: "Rig AI Custom Build",
        components: activeBuildParts.map(p => ({
           type: mapCategoryToEnum(p.type),
           product: p.product.id || p.product._id || p.product,
           quantity: 1
        })),
        totalPrice: activeBuildParts.reduce((sum, p) => sum + (p.product.price || 0), 0)
      };
      
      await apiClient.post('/builds', payload);
      alert("PC Build saved to your profile!");
      setIsBuilding(false);
      setActiveBuildParts([]);
      setMessages(prev => [...prev, { role: 'ai', text: "Success! Your custom PC has been saved to your profile under 'Your Builds'." }]);
    } catch (error) {
      alert("Failed to save build to profile.");
      console.error(error);
    }
  };


  const startIdleTimer = () => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: `I am waiting,\n **${customerName}** how Can I help you today?` }]);
    }, 60000); // 1 minute
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const startTime = Date.now();
      
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      
      let promptText = `You are RigCraft, an AI PC Builder Assistant. 
      
Here is the live catalog:
${JSON.stringify(catalogData)}

Active Build State: ${isBuilding ? 'User is building a PC' : 'General chat'}
Selected Parts: ${JSON.stringify(activeBuildParts)}

INSTRUCTIONS:
1. If the user wants to build a PC, guide them step-by-step: CPU -> Motherboard -> RAM -> GPU -> Storage -> Power Supply -> Cabinet -> Cooling.
2. Only recommend products from the catalog. Use exact prices. 
3. CRITICAL INSTRUCTION: When suggesting a product from the catalog, you MUST append its exact ID in brackets like this: [PRODUCT_CARD: id]. Example: "I recommend the RTX 4090. [PRODUCT_CARD: 64a1b2c...]"
4. Wait for the user to select a component (via UI button) before recommending the next category.
5. BUDGET TRACKING: Analyze the conversation to find the user's total budget. Before suggesting a component, calculate the REMAINING BUDGET (Total Budget - Sum of Selected Parts). You MUST ONLY suggest components whose price allows the remaining categories to also be purchased without exceeding the Total Budget. If you can't find a component that fits, inform the user they need to increase their budget.
6. If the user has finished building, or all parts are selected, list all selected components and the final total price, then output exactly [BUILD_COMPLETE].

User: ${userText}`;
      
      const result = await model.generateContent(promptText);
      const responseText = result.response.text();
      
      // Ensure the typing animation shows for at least 2 seconds
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
      }
      
      setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      
      // Still enforce a delay on error so the UI doesn't jump
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
      startIdleTimer();
    }
  };

  // Hide on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Format bold text function
  const renderFormattedText = (text) => {
    // Split by ** to find bold sections
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleChatbotClick = () => {
    if (!isLoggedIn) {
      setShowLoginPopup(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      {/* Floating Chatbot Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={handleChatbotClick}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, rotate: [0, -40, 40, -40, 40, 0] }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              rotate: {
                repeat: Infinity,
                repeatDelay: 10, // Shake every 10 seconds
                duration: 0.5
              }
            }}
            className="fixed bottom-22 right-8 w-16 h-16 bg-[var(--color-primary)]/30 backdrop-blur-sm rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-105 z-50 overflow-hidden border-2"
          >
            <img 
              src="/chatbot.png" 
              alt="AI Chatbot" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                // Fallback if image fails to load
                e.target.parentElement.innerHTML = '<div class="w-full h-full bg-[var(--color-primary)] flex items-center justify-center text-white"><svg class="w-8 h-8" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SmartToyIcon"><path d="m22.5 10-2-3H19V5c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v2H3.5l-2 3v2h2v4c0 1.1.9 2 2 2h2v2h2v-2h6v2h2v-2h2c1.1 0 2-.9 2-2v-4h2v-2zm-6-2.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-9 0c.83 0 1.5.67 1.5 1.5S8.33 10.5 7.5 10.5 6 9.83 6 9s.67-1.5 1.5-1.5z"></path></svg></div>';
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chatbox Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-28 right-6 w-[350px] md:w-[400px] h-[550px] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] z-50 flex flex-col border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[var(--color-primary)] p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full p-1 overflow-hidden">
                  <img src="/chatbot.png" alt="Bot" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px]">RigCraft AI</h3>
                  <p className="text-xs text-blue-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors cursor-pointer">
                <CloseIcon />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#F0F2F5] flex flex-col gap-3">
              {messages.map((msg, index) => {
                if (msg.role === 'ai') {
                  const productRegex = /\[PRODUCT_CARD:\s*([^\]]+)\]/g;
                  const buildCompleteRegex = /\[BUILD_COMPLETE\]/g;
                  
                  let text = msg.text;
                  const isBuildComplete = buildCompleteRegex.test(text);
                  
                  let match;
                  const productIds = [];
                  while ((match = productRegex.exec(text)) !== null) {
                    productIds.push(match[1].trim());
                  }
                  
                  const cleanText = text.replace(productRegex, '').replace(buildCompleteRegex, '').trim();
                  const allCatalog = [...(catalogData?.products || []), ...(catalogData?.prebuilts || [])];
                  const recommendedProducts = productIds.map(id => allCatalog.find(p => p.id === id)).filter(Boolean);
                  
                  return (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-start flex-col gap-2 w-full"
                    >
                      {cleanText && (
                        <div className="max-w-[85%] bg-[var(--color-primary)] text-white p-3 rounded-2xl rounded-tl-sm shadow-md">
                          <div className="text-[13px] leading-relaxed whitespace-pre-wrap">
                            {renderFormattedText(cleanText)}
                          </div>
                        </div>
                      )}
                      
                      {recommendedProducts.length > 0 && (
                        <div className="flex flex-col gap-3 w-[85%] mt-1">
                          {recommendedProducts.map(p => (
                            <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                              {(() => {
                                const finalImage = (p.image && p.image.includes('localhost:5000/uploads')) 
                                  ? 'https://placehold.co/400x400/transparent/black?text=Product'
                                  : p.image;
                                
                                return finalImage ? (
                                  <div className="h-32 w-full bg-white p-2 border-b border-gray-100 flex items-center justify-center">
                                    <img 
                                      src={finalImage} 
                                      alt={p.name} 
                                      className="h-full object-contain" 
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/400x400/transparent/black?text=Product';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="h-32 w-full bg-gray-50 p-2 border-b border-gray-100 flex items-center justify-center">
                                    <img src="https://placehold.co/400x400/transparent/black?text=Product" alt="Placeholder" className="h-full object-contain opacity-50" />
                                  </div>
                                );
                              })()}
                              <div className="p-3 flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{p.category}</span>
                                <h4 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{p.name}</h4>
                                <div className="text-[var(--color-primary)] font-black mt-1">₹{p.price?.toLocaleString('en-IN')}</div>
                                
                                <div className="flex flex-col gap-2 mt-3">
                                  <button 
                                    onClick={() => {
                                      if (!isBuilding) setIsBuilding(true);
                                      handleSelectComponent(p);
                                    }}
                                    disabled={activeBuildParts.some(part => part.type === p.category || part.product.id === p.id)}
                                    className={`w-full text-white font-bold py-2 rounded-md transition-colors text-xs cursor-pointer ${
                                      activeBuildParts.some(part => part.type === p.category || part.product.id === p.id) 
                                      ? 'bg-gray-400 cursor-not-allowed' 
                                      : 'bg-[var(--color-primary)] hover:brightness-110'
                                    }`}
                                  >
                                    {activeBuildParts.some(part => part.type === p.category || part.product.id === p.id) ? 'Category Selected' : 'Add to Build'}
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setIsOpen(false);
                                      const destId = p.type === 'product' && p.slug ? p.slug : p.id;
                                      navigate(`/detail/${destId}?type=${p.type}`);
                                    }}
                                    className="w-full bg-gray-100 text-gray-700 font-bold py-2 rounded-md hover:bg-gray-200 transition-colors text-xs border border-gray-200 cursor-pointer"
                                  >
                                    View Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {isBuildComplete && isBuilding && (
                        <div className="w-[85%] bg-green-50 border border-green-200 rounded-xl p-4 mt-2 shadow-sm flex flex-col items-center text-center">
                          <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mb-2">
                            <span className="text-xl font-bold">✓</span>
                          </div>
                          <h4 className="font-bold text-green-800 text-sm mb-1">Build Complete!</h4>
                          <p className="text-xs text-green-700 mb-3">You have selected all required components.</p>
                          <button 
                            onClick={handleSaveBuild}
                            className="w-full bg-green-600 text-white font-bold py-2.5 rounded-md hover:bg-green-700 transition-colors shadow-md text-sm cursor-pointer"
                          >
                            Save Build to Profile
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                } else {
                  return (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-[80%] bg-white text-black p-3 rounded-2xl rounded-tr-sm shadow-md border border-gray-100">
                        <div className="text-[13px] leading-relaxed whitespace-pre-wrap">
                          {renderFormattedText(msg.text)}
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              })}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[var(--color-primary)] text-white rounded-tl-xl rounded-tr-xl rounded-br-xl shadow-sm p-4 w-16">
                    <div className="flex items-center justify-center gap-1 h-3">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-200">
              <form onSubmit={handleSend} className="flex items-center gap-2 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-gray-100 text-gray-800 rounded-full px-4 py-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ${
                    !input.trim() || isTyping ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[var(--color-primary)] text-white hover:brightness-110'
                  }`}
                >
                  <SendIcon fontSize="small" sx={{ marginLeft: '2px' }} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Popup */}
      <AnimatePresence>
        {showLoginPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowLoginPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <CloseIcon />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SmartToyIcon sx={{ fontSize: 32 }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
                <p className="text-gray-600 text-[14px]">
                  Please sign in to chat with RigCraft AI Assistant. I'm ready to help you build the perfect PC!
                </p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLoginPopup(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowLoginPopup(false);
                    navigate('/login');
                  }}
                  className="flex-1 py-2 px-4 bg-[var(--color-primary)] rounded-sm font-medium text-white hover:opacity-90 transition-opacity shadow-md cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
