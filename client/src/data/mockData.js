const categories = ['Gaming', 'Streaming', 'Creator', 'Workstation', 'Budget', 'Premium', 'Office'];

// Auto-generate mock data matching the new Amazon-style cards
export const generateMockData = () => {
  const images = ['/PC1.jpeg', '/PC2.avif', '/PC3.avif'];
  let idCounter = 1;
  const data = [];
  
  categories.forEach((cat) => {
    for (let i = 1; i <= 8; i++) {
      let priceBase = 50000;
      if (cat === 'Premium' || cat === 'Workstation') priceBase = 120000;
      if (cat === 'Budget' || cat === 'Office') priceBase = 30000;
      
      const priceVal = priceBase + (i * 12000);
      const mrpVal = priceVal + (priceVal * 0.25); // 25% higher MRP
      const isIntel = i % 2 !== 0;
      
      data.push({
        id: idCounter++,
        title: `PCForge ${cat} Edition, ${isIntel ? 'Intel Core i7-14700K' : 'AMD Ryzen 7 7800X3D'}, ${16 * (i%2 ? 1 : 2)}GB RAM, 1TB NVMe SSD, RTX ${4090 - (i * 10)} ${i % 2 === 0 ? '16GB' : '24GB'}, Liquid Cooled, Windows 11`,
        category: cat,
        priceVal: priceVal,
        price: `₹${priceVal.toLocaleString('en-IN')}`,
        mrp: `₹${mrpVal.toLocaleString('en-IN')}`,
        discount: '20% off',
        image: images[idCounter % 3],
        brand: isIntel ? 'Intel' : 'AMD',
        rating: 4 + (i % 2 === 0 ? 0.5 : 0),
        reviews: 24 + (i * 17)
      });
    }
  });
  return data;
};

export const allPCs = generateMockData();
