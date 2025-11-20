import React, { useState } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { CURRENCY_SYMBOL } from '../config';
import { Button } from './ui/Button';
import { Check, X, QrCode } from 'lucide-react';

export const Pricing: React.FC = () => {
  const { settings, requestPayment } = useGlobalState();
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [trxId, setTrxId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (pkgId: string) => {
    setSelectedPkg(pkgId);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPkg && trxId) {
      requestPayment(selectedPkg, trxId);
      setIsModalOpen(false);
      setTrxId('');
      setSelectedPkg(null);
    }
  };

  return (
    <div className="py-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-4">Fuel Your Creativity</h2>
        <p className="text-slate-400">Choose a credit package that suits your needs. Simple, transparent pricing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {settings.creditPackages.map((pkg) => (
          <div key={pkg.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col relative hover:border-violet-500/50 transition-colors">
            <div className="mb-4">
              <span className="text-lg font-medium text-violet-400">{pkg.name}</span>
              <div className="mt-2 flex items-baseline">
                <span className="text-4xl font-bold text-white">{CURRENCY_SYMBOL}{pkg.price}</span>
              </div>
            </div>

            <ul className="flex-1 space-y-4 mb-8">
              <li className="flex items-center gap-3 text-slate-300">
                <Check size={18} className="text-green-400" />
                <span>{pkg.credits} Generation Credits</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Check size={18} className="text-green-400" />
                <span>Full Commercial Rights</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Check size={18} className="text-green-400" />
                <span>Priority Generation</span>
              </li>
            </ul>

            <Button onClick={() => handleSelect(pkg.id)} className="w-full">
              Buy Now
            </Button>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold mb-6">Complete Payment</h3>
            
            <div className="space-y-6">
              <div className="bg-slate-800/50 p-4 rounded-xl text-center">
                <p className="text-sm text-slate-400 mb-2">Scan to Pay with {settings.paymentDetails.methodName}</p>
                <div className="bg-white p-2 inline-block rounded-lg mb-3">
                  {/* Simulating QR Code display */}
                  <img src={settings.paymentDetails.qrCodeUrl} alt="QR Code" className="w-32 h-32 object-cover" />
                </div>
                <p className="font-mono text-lg text-white tracking-wider">{settings.paymentDetails.accountNumber}</p>
              </div>

              <form onSubmit={handleSubmit}>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Transaction ID (TrxID)
                </label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="e.g. 8X9D2M..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white mb-4 focus:ring-2 focus:ring-violet-500 outline-none"
                />
                <Button type="submit" className="w-full">
                  Submit for Verification
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
