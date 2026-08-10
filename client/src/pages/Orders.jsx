import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import InventoryIcon from '@mui/icons-material/Inventory';
import CancelIcon from '@mui/icons-material/Cancel';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import apiClient from '../api/client';
import { useToast } from '../components/toast/useToast';
import Pagination from '../components/Pagination';
import SelectDropdown from '../components/SelectDropdown';
import ConfirmModal from '../components/ConfirmModal';

const ITEMS_PER_PAGE = 5;

const ORDER_STATUSES = [
  { label: 'Order Confirmed', icon: <CheckCircleIcon fontSize="small" /> },
  { label: 'In Process', icon: <AutorenewIcon fontSize="small" /> },
  { label: 'On the way', icon: <LocalShippingIcon fontSize="small" /> },
  { label: 'Scheduled for delivery', icon: <InventoryIcon fontSize="small" /> },
  { label: 'Delivered', icon: <CheckCircleIcon fontSize="small" /> }
];

const mapBackendStatus = (status) => {
  switch(status) {
    case 'pending':
    case 'confirmed': return 'Order Confirmed';
    case 'processing': return 'In Process';
    case 'shipped': return 'On the way';
    case 'out_for_delivery': return 'Scheduled for delivery';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    default: return 'Order Confirmed';
  }
};

const getItemLink = (it) => {
  if (it.itemType === 'bundle') return `/bundle/${it.slug || it.id}`;
  if (it.itemType === 'prebuilt') return `/detail/${it.id}?type=prebuilt`;
  return `/detail/${it.id}`;
};

const Orders = ({ embedded = false }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleItems = (orderId) => setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const { data } = await apiClient.get('/orders');
        if (data.success) {
          const formattedOrders = data.data.orders.map(order => ({
            id: order._id,
            rawStatus: order.orderStatus,
            status: mapBackendStatus(order.orderStatus),
            date: new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            total: order.total,
            items: (order.items || []).map(it => ({
              id: it.item?._id || '',
              title: it.name || it.item?.name || it.item?.title || 'Unknown Item',
              quantity: it.quantity || 1,
              itemType: it.itemType,
              slug: it.item?.slug,
            })),
          }));
          setOrders(formattedOrders);
        }
      } catch (error) {
        console.error('Failed to fetch orders', error);
        toast('Failed to load orders', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isLoggedIn, toast]);

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    if (filter === 'Delivered') return order.status === 'Delivered';
    if (filter === 'Live') return order.status !== 'Delivered' && order.status !== 'Cancelled';
    if (filter === 'Last 30 Days') {
      const orderDate = new Date(order.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return orderDate >= thirtyDaysAgo;
    }
    if (filter === '2026') return order.date.includes('2026');
    if (filter === '2025') return order.date.includes('2025');
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const [prevTotalPages, setPrevTotalPages] = useState(totalPages);
  if (prevTotalPages !== totalPages) {
    setPrevTotalPages(totalPages);
    setPage((prev) => Math.min(prev, totalPages));
  }
  const currentPage = Math.min(page, totalPages);
  const pagedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelClick = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      await apiClient.patch(`/orders/${orderToCancel.id}/cancel`, { reason: 'User cancelled' });
      setOrders(orders.map(o => o.id === orderToCancel.id ? { ...o, status: 'Cancelled', rawStatus: 'cancelled' } : o));
      toast('Order cancelled successfully');
    } catch (error) {
      toast('Failed to cancel order', 'error');
    }
    setShowCancelModal(false);
    setOrderToCancel(null);
  };

  const getStatusIndex = (status) => {
    return ORDER_STATUSES.findIndex(s => s.label === status);
  };

  const content = isLoggedIn ? (
    <FadeUp>
          <div className="flex flex-col gap-6">
            {/* RIGHT SIDE: ORDER LIST */}
            <div className="w-full flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-black text-gray-900 mb-2 sm:mb-0">My Orders</h1>
                <div className="w-full sm:w-[220px] shrink-0">
                  <SelectDropdown
                    value={filter}
                    onChange={setFilter}
                    placeholder="Filter"
                    options={[
                      { value: 'All', label: 'All Orders' },
                      { value: 'Live', label: 'Live Orders' },
                      { value: 'Delivered', label: 'Delivered' },
                      { value: 'Last 30 Days', label: 'Last 30 Days' },
                      { value: '2026', label: '2026' },
                      { value: '2025', label: '2025' },
                    ]}
                  />
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-white p-10 text-center border border-gray-200 shadow-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
                  <InventoryIcon sx={{ fontSize: 64, color: '#CBD5E1' }} className="mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-500 text-sm">You have no orders matching the selected filters.</p>
                </div>
              ) : (
                <>
                  {pagedOrders.map(order => {
                    const currentIndex = getStatusIndex(order.status);
                    
                    return (
                    <div key={order.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
                      {/* Order Header */}
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex gap-8">
                          <div>
                            <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Order Placed</div>
                            <div className="text-[14px] text-gray-900 font-bold">{order.date}</div>
                          </div>
                          <div>
                            <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Total</div>
                            <div className="text-[14px] text-gray-900 font-bold">${order.total?.toFixed(2) ?? '0.00'}</div>
                          </div>
                        </div>
                        <div className="text-[13px] font-medium text-gray-600 text-right sm:text-left">
                          Order # <span className="font-bold text-gray-900">{order.id}</span>
                        </div>
                      </div>

                      {/* Order Content */}
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          
                          {/* Item Details */}
                          <div className="flex flex-col gap-3 flex-1">
                            {(order.items || []).slice(0, expandedOrders[order.id] ? order.items.length : 1).map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                  <h3 className="text-[16px] font-bold text-gray-900 leading-tight line-clamp-2">{it.title}</h3>
                                  <p className="text-[13px] text-gray-500 font-medium mt-0.5">Qty: {it.quantity}</p>
                                </div>
                                {it.itemType === 'savedBuild' ? (
                                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide shrink-0">Custom Build</span>
                                ) : (
                                  <button 
                                    onClick={() => navigate(getItemLink(it))}
                                    className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wide shrink-0"
                                  >
                                    View Item
                                  </button>
                                )}
                              </div>
                            ))}
                            {(order.items || []).length > 1 && (
                              <button
                                onClick={() => toggleItems(order.id)}
                                className="w-fit flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wide mt-1"
                              >
                                <ExpandMoreIcon
                                  sx={{ fontSize: 16, transition: 'transform 0.2s', transform: expandedOrders[order.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                />
                                {expandedOrders[order.id]
                                  ? `Show fewer (${order.items.length})`
                                  : `${order.items.length - 1} more item${order.items.length - 1 > 1 ? 's' : ''}`}
                              </button>
                            )}
                            <div className="mt-2">
                              {order.status === 'Delivered' ? (
                                <div className="text-[13px] font-bold text-green-600 uppercase tracking-wide flex items-center gap-1 bg-green-50 px-3 py-1 rounded-sm border border-green-200 w-fit">
                                  <CheckCircleIcon fontSize="small" /> Product Delivered
                                </div>
                              ) : (
                                <button 
                                  onClick={() => handleCancelClick(order)}
                                  className="text-[12px] font-bold text-red-500 border border-gray-300 rounded-sm px-3 py-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all uppercase tracking-wide flex items-center gap-1 shadow-sm"
                                >
                                  <CancelIcon fontSize="small" /> Cancel Order
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Order Status Progress */}
                          <div className="flex-1 md:border-l md:border-gray-100 md:pl-8 flex flex-col justify-center">
                            <h4 className="text-[15px] font-black text-gray-900 mb-4">{order.status === 'Delivered' ? 'Delivered on time' : 'Arriving soon'}</h4>
                            
                            {/* Stepper */}
                            <div className="relative">
                              {/* Background Line */}
                              <div className="absolute top-3 left-3 right-3 h-[2px] bg-gray-200 z-0"></div>
                              {/* Progress Line */}
                              <div 
                                className="absolute top-3 left-3 h-[2px] bg-green-500 z-0 transition-all duration-500"
                                style={{ width: `calc(${(currentIndex / (ORDER_STATUSES.length - 1)) * 100}% - 24px)` }}
                              ></div>
                              
                              <div className="relative z-10 flex justify-between">
                                {ORDER_STATUSES.map((statusObj, idx) => {
                                  const isCompleted = idx <= currentIndex;
                                  const isCurrent = idx === currentIndex;
                                  
                                  return (
                                    <div key={idx} className="flex flex-col items-center gap-2">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        {isCompleted ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <div className="w-2 h-2 rounded-full bg-white"></div>}
                                      </div>
                                      <span className={`text-[10px] font-bold uppercase tracking-wider w-16 text-center leading-tight ${isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {statusObj.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )}

              {/* Contact Us Box */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 border border-blue-100 shadow-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
                <div className="flex items-center gap-3 mb-3 text-blue-700">
                  <SupportAgentIcon />
                  <h2 className="text-[15px] font-black uppercase tracking-wider">Need Help?</h2>
                </div>
                <p className="text-[13px] text-gray-700 font-medium mb-4 leading-relaxed">
                  Have an issue with your order? Our support team is available 24/7 to assist you.
                </p>
                <button 
                  onClick={() => navigate('/contact?type=order')}
                  className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-sm hover:bg-blue-700 transition-colors text-[13px] tracking-wide uppercase"
                >
                  Contact Us
                </button>
              </div>
            </div>

          </div>
    </FadeUp>
  ) : (
    <FadeUp>
      <div className="bg-white p-10 mt-8 text-center border border-gray-200 shadow-sm max-w-2xl mx-auto" style={{ borderRadius: 'var(--radius-sm)' }}>
        <WarningAmberIcon sx={{ fontSize: 64, color: '#CBD5E1' }} className="mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Please Login</h3>
        <p className="text-gray-500 text-[14px] mb-6">Login and purchase to see your orders.</p>
        <button 
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white font-bold py-2.5 px-8 rounded-sm hover:bg-blue-700 transition-colors text-[13px] tracking-wide uppercase inline-flex items-center"
        >
          Login
        </button>
      </div>
    </FadeUp>
  );

  const modalContent = (
    <ConfirmModal
      isOpen={showCancelModal}
      title="Cancel Order?"
      message={`Are you sure you want to cancel order ${orderToCancel?.id}? This action cannot be undone.`}
      confirmLabel="Yes, Cancel"
      cancelLabel="No, Keep order"
      danger
      onConfirm={confirmCancel}
      onCancel={() => { setShowCancelModal(false); setOrderToCancel(null); }}
    />
  );

  if (embedded) {
    return (
      <>
        {content}
        {modalContent}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Orders' }]} />
        {content}
      </div>
      {modalContent}
    </div>
  );
};

export default Orders;
