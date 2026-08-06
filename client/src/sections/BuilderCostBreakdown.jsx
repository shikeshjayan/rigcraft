import { useState, useEffect } from 'react';
import { useBuilder, STEPS, MULTI_SLOT_CATEGORIES } from '../context/BuilderContext';
import { getPublicSettings } from '../services/settings.service';

const BuilderCostBreakdown = () => {
  const { selectedParts, basePrice, assemblyFee, assemblyMode, totalPrice } = useBuilder();
  const [taxSettings, setTaxSettings] = useState(null);

  useEffect(() => {
    let mounted = true;
    getPublicSettings().then(settings => {
      if (mounted) setTaxSettings(settings?.tax || null);
    }).catch(() => {
      if (mounted) setTaxSettings(null);
    });
    return () => { mounted = false; };
  }, []);

  const rate = Number(taxSettings?.rate) || 0;
  const pricesIncludeTax = taxSettings?.pricesIncludeTax ?? true;
  const taxName = taxSettings?.name || 'Tax';
  const estimatedTax = pricesIncludeTax || !rate ? 0 : Math.round(basePrice * rate);
  const grandTotal = totalPrice + estimatedTax;

  const formatPrice = (priceVal) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(priceVal);
  };

  const lines = STEPS
    .filter(s => s.category !== null)
    .map(step => {
      const value = selectedParts[step.category];
      const isMultiSlot = MULTI_SLOT_CATEGORIES.includes(step.category);
      const entries = isMultiSlot ? (Array.isArray(value) ? value : []) : (value ? [{ item: value, quantity: 1 }] : []);
      return { label: step.label, entries };
    });

  const hasParts = basePrice > 0;

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <h2 className="text-[24px] font-bold text-[var(--color-text)] mb-1">Build Cost Breakdown</h2>
        <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">Transparent pricing for every component in your build.</p>

        {!hasParts ? (
          <div className="bg-white border border-[#CBD5E1] p-8 text-center" style={{ borderRadius: 'var(--radius-sm)' }}>
            <div className="text-[15px] font-bold text-[var(--color-text)] mb-1">No components selected yet.</div>
            <p className="text-[13px] text-[var(--color-text-secondary)]">Start adding components above to see a detailed cost breakdown.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#CBD5E1] max-w-[720px] overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
            {/* Line items */}
            <div className="flex flex-col divide-y divide-[var(--color-border)]">
              {lines.map(({ label, entries }) => {
                if (entries.length === 0) return null;
                const itemTotal = entries.reduce((sum, e) => {
                  const qty = Math.max(1, Number(e.quantity) || 1);
                  return sum + (e.item?.priceVal || 0) * qty;
                }, 0);
                return (
                  <div key={label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <span className="text-[13px] font-bold text-[var(--color-text)]">{label}</span>
                      <span className="text-[12px] text-[var(--color-text-secondary)] ml-2">
                        {entries.map(e => {
                          const qty = Math.max(1, Number(e.quantity) || 1);
                          return `${e.item?.title || 'Part'}${qty > 1 ? ` × ${qty}` : ''}`;
                        }).join(', ')}
                      </span>
                    </div>
                    <span className="text-[14px] font-bold text-[var(--color-text)] whitespace-nowrap">{formatPrice(itemTotal)}</span>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="border-t border-[#CBD5E1] bg-[var(--color-surface)] px-5 py-4 flex flex-col gap-2">
              <div className="flex justify-between text-[14px]">
                <span className="text-[var(--color-text-secondary)]">Subtotal</span>
                <span className="font-bold text-[var(--color-text)]">{formatPrice(basePrice)}</span>
              </div>
              {assemblyFee > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-[var(--color-text-secondary)]">Assembly Fee ({assemblyMode === 'assembled' ? 'Assembled' : 'Parts'})</span>
                  <span className="font-bold text-[var(--color-text)]">{formatPrice(assemblyFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-[14px]">
                <span className="text-[var(--color-text-secondary)]">
                  Estimated {taxName}{pricesIncludeTax ? ' (Inclusive)' : ` (${(rate * 100).toFixed(0)}%)`}
                </span>
                <span className="font-bold text-[var(--color-text)]">{pricesIncludeTax ? 'Included' : formatPrice(estimatedTax)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 mt-1 border-t border-[#CBD5E1]">
                <span className="text-[16px] font-bold text-[var(--color-text)]">Total</span>
                <span className="text-[24px] font-extrabold text-[var(--color-primary)]">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BuilderCostBreakdown;
