import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../shared/api/axios';
import { ENDPOINTS } from '../shared/api/endpoints';

let cached = null;

const DynamicLogo = ({ className = '', onClick }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(() => cached);

  useEffect(() => {
    if (cached) {
      setData(cached);
      return;
    }
    api.get(ENDPOINTS.SETTINGS.PUBLIC)
      .then((res) => {
        const d = res.data?.data || null;
        cached = d;
        setData(d);
      })
      .catch(() => {});
  }, []);

  const handleClick = onClick || (() => navigate('/'));
  const storeName = data?.general?.storeName || 'RigCraft';

  return (
    <h1
      onClick={handleClick}
      className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tighter cursor-pointer ${className}`}
    >
      {storeName.toUpperCase()}
    </h1>
  );
};

export default DynamicLogo;
