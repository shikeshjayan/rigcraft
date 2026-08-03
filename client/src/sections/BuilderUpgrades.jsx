import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoginPrompt from '../components/LoginPrompt';
import { normalizeBuilderProduct, normalizeCategory, getRawCategory } from '../utils/builderProducts';

const UPGRADE_CATEGORIES = ['ssd', 'cooling', 'psu'];

const BuilderUpgrades = () => {
  const [upgrades, setUpgrades] = useState([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpgrades = async () => {
      try {
        const { data } = await apiClient.get('/products?limit=1000');
        if (data && data.data) {
          const docs = data.data.docs || data.data;
          const pcArray = Array.isArray(docs) ? docs : [];

          // Keep only upgrade categories (storage, cooling, PSU)
          const upgradeItems = pcArray
            .filter(p => UPGRADE_CATEGORIES.includes(normalizeCategory(getRawCategory(p))))
            .slice(0, 4)
            .map(p => normalizeBuilderProduct(p));

          setUpgrades(upgradeItems);
        }
      } catch (error) {
        console.error('Failed to fetch upgrades', error);
      }
    };
    fetchUpgrades();
  }, []);

  const handleAddToBuild = (item) => {
    if (!isLoggedIn) {
      setLoginMessage('You need to log in to your account to add items to your build.');
      setShowLoginPrompt(true);
      return;
    }

    const draftBuild = JSON.parse(localStorage.getItem('draftBuild')) || {};
    const categoryKey = item.category || 'misc';

    if (draftBuild[categoryKey]) {
      if (!window.confirm(`You already have a ${categoryKey} in your active build. Replace it?`)) return;
    }

    draftBuild[categoryKey] = item;
    localStorage.setItem('draftBuild', JSON.stringify(draftBuild));
    navigate('/builder');
  };

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        
        <h2 className="text-[20px] font-bold text-[#0F172A] mb-6">
          Recommended Upgrades
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {upgrades.map(item => (
            <Link to={`/detail/${item.id}`} key={item.id} className="block h-full">
              <Card 
                id={item.id}
                image={item.image}
                title={item.title}
                specs={item.specs}
                description={item.description}
                price={item.price}
                mrp={item.mrp}
                discount={item.discount}
                category={item.category}
                tag="RECOMMENDED"
                tagColor="var(--color-primary)"
                buttonText="Add to Build"
                onButtonClick={() => handleAddToBuild(item)}
              />
            </Link>
          ))}
        </div>

      </div>

      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message={loginMessage}
      />
    </section>
  );
};

export default BuilderUpgrades;
