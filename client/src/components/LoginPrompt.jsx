import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPrompt = ({ isOpen, onClose, message }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }}
    >
      <div 
        className="bg-white p-6 shadow-2xl max-w-sm w-full relative animate-in fade-in zoom-in duration-200"
        style={{ borderRadius: 'var(--radius-sm)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-extrabold text-gray-900 mb-2">Login Required</h3>
        <p className="text-gray-600 mb-6 text-sm font-medium">{message || 'You need to log in to your account to perform this action.'}</p>
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="flex-1 py-2 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/login');
            }}
            className="flex-1 py-2 font-bold text-white bg-[var(--color-primary)] hover:opacity-90 transition-colors shadow-md cursor-pointer"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
