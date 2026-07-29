import React from 'react';
import { useParams } from 'react-router-dom';
import ComponentsHero from '../sections/ComponentsHero';
import ComponentsCatalog from '../sections/ComponentsCatalog';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';

const Components = () => {
  const { category } = useParams();
  
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Components', path: category ? '/components' : undefined }
  ];
  if (category) {
    breadcrumbItems.push({ label: category.replace(/-/g, ' ').toUpperCase() });
  }
  return (
    <>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 pt-4 pb-0 bg-[var(--color-bg-primary)]">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      {/* 1st section: bg-primary */}
      <FadeUp delay={0.1}><ComponentsHero category={category} /></FadeUp>
      
      {/* 2nd section: bg-secondary */}
      <FadeUp delay={0.2}><ComponentsCatalog /></FadeUp>
    </>
  );
};

export default Components;
