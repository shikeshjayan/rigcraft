import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';

const WhyShopDeals = () => {
  const items = [
    { icon: <VerifiedUserIcon sx={{ fontSize: 30 }} />, title: 'Genuine Products', text: '100% authentic hardware, sourced directly from brands and authorised distributors.' },
    { icon: <LockIcon sx={{ fontSize: 30 }} />, title: 'Secure Payments', text: 'Encrypted checkout with UPI, cards and net banking. Your details stay private.' },
    { icon: <WorkspacePremiumIcon sx={{ fontSize: 30 }} />, title: 'Manufacturer Warranty', text: 'Every component and prebuilt ships with its full official warranty.' },
    { icon: <LocalShippingIcon sx={{ fontSize: 30 }} />, title: 'Fast Delivery', text: 'Carefully packed and shipped fast, right to your doorstep.' },
    { icon: <AssignmentReturnIcon sx={{ fontSize: 30 }} />, title: 'Easy Returns', text: 'Changed your mind? Simple, hassle-free returns within the return window.' },
  ];

  return (
    <section className="w-full py-16 border-t border-[var(--color-border)]" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-[24px] md:text-[32px] font-extrabold text-[var(--color-text)] tracking-tight uppercase">
            Why Shop The Sale
          </h2>
          <div className="w-16 h-1 bg-[#0052FF] mt-2 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center px-4 py-8 bg-white border border-[var(--color-border)] hover:shadow-md transition-shadow"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-[#F0F6FF] text-[#0052FF]">
                {item.icon}
              </div>
              <h3 className="text-[14px] font-bold text-[var(--color-text)] mb-1.5">{item.title}</h3>
              <p className="text-[12px] text-[var(--color-text-secondary)] font-medium leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyShopDeals;
