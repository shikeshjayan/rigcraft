import VerifiedIcon from '@mui/icons-material/Verified';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LockIcon from '@mui/icons-material/Lock';

const BENEFITS = [
  { icon: VerifiedIcon, title: 'Compatibility Checked', description: 'Every component is cross-verified against your build in real time.' },
  { icon: VerifiedUserIcon, title: 'Genuine Products', description: '100% authentic components sourced directly from authorized distributors.' },
  { icon: LocalShippingIcon, title: 'Fast Delivery', description: 'Insured express shipping with live tracking on every order.' },
  { icon: SupportAgentIcon, title: 'Expert Support', description: 'PC building experts available to help you before and after purchase.' },
  { icon: WorkspacePremiumIcon, title: 'Manufacturer Warranty', description: 'Full manufacturer warranty on every component, backed by RigCraft.' },
  { icon: LockIcon, title: 'Secure Checkout', description: 'Encrypted payments with multiple safe and trusted payment options.' }
];

const BuilderWhyUs = () => {
  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-[28px] font-bold text-[#0F172A] mb-2">Why Build with RigCraft</h2>
          <p className="text-[14px] text-[#64748B] max-w-2xl mx-auto">
            Build with total confidence — we take care of compatibility, quality, and support from start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="bg-white border border-[#CBD5E1] p-6 flex flex-col gap-3 hover:shadow-lg transition-shadow"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <div className="w-11 h-11 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[var(--color-primary)]">
                  <Icon sx={{ fontSize: 22 }} />
                </div>
                <div className="text-[16px] font-bold text-[#0F172A]">{benefit.title}</div>
                <p className="text-[13px] text-[#64748B] leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BuilderWhyUs;
