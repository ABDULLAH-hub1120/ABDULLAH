import React, { useState, useRef } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { CURRENCY_SYMBOL } from '../config';
import { Button } from './ui/Button';
import { Users, DollarSign, Activity, CheckCircle, XCircle, Lock, Unlock, Trash2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    users, payments, settings, 
    approvePayment, rejectPayment, toggleUserBlock, updateSettings 
  } = useGlobalState();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments' | 'settings'>('overview');
  
  // Stats Calculation
  const totalUsers = users.length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const totalRevenue = payments
    .filter(p => p.status === 'approved')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Settings State
  const [localSettings, setLocalSettings] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSettingsSave = () => {
    updateSettings(localSettings);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings({
          ...localSettings,
          paymentDetails: {
            ...localSettings.paymentDetails,
            qrCodeUrl: reader.result as string
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
          <Icon className={color.replace('bg-', 'text-')} size={20} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex space-x-4 border-b border-slate-800 pb-4 overflow-x-auto">
        {['overview', 'users', 'payments', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg capitalize font-medium transition-colors whitespace-nowrap ${
              activeTab === tab ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Session Users" value={totalUsers} icon={Users} color="bg-blue-500" />
          <StatCard title="Pending Approvals" value={pendingPayments} icon={Activity} color="bg-orange-500" />
          <StatCard title="Session Revenue" value={`${CURRENCY_SYMBOL}${totalRevenue}`} icon={DollarSign} color="bg-green-500" />
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Credits</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-white">{user.name}</td>
                    <td className="p-4 text-slate-400">{user.email}</td>
                    <td className="p-4 text-violet-400 font-bold">{user.credits}</td>
                    <td className="p-4"><span className="px-2 py-1 rounded bg-slate-800 text-xs capitalize">{user.role}</span></td>
                    <td className="p-4">
                      {user.isBlocked ? (
                        <span className="text-red-400 flex items-center gap-1"><XCircle size={14} /> Blocked</span>
                      ) : (
                        <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14} /> Active</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => toggleUserBlock(user.id)}
                          className={`p-2 rounded hover:bg-slate-700 transition-colors ${user.isBlocked ? 'text-green-400' : 'text-red-400'}`}
                          title={user.isBlocked ? "Unblock" : "Block"}
                        >
                          {user.isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Package</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">TrxID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payments.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">No payment requests yet.</td></tr>
                )}
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-slate-300">{payment.userEmail}</td>
                    <td className="p-4 text-white">{payment.packageName}</td>
                    <td className="p-4 text-violet-400 font-bold">{CURRENCY_SYMBOL}{payment.amount}</td>
                    <td className="p-4 font-mono text-slate-400">{payment.trxId}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        payment.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {payment.status === 'pending' && (
                        <>
                          <button onClick={() => approvePayment(payment.id)} className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/40 transition-colors">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => rejectPayment(payment.id)} className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 transition-colors">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-6">Payment Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Method Name</label>
                <input 
                  value={localSettings.paymentDetails.methodName}
                  onChange={(e) => setLocalSettings({...localSettings, paymentDetails: {...localSettings.paymentDetails, methodName: e.target.value}})}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Account Number</label>
                <input 
                  value={localSettings.paymentDetails.accountNumber}
                  onChange={(e) => setLocalSettings({...localSettings, paymentDetails: {...localSettings.paymentDetails, accountNumber: e.target.value}})}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">QR Code Image</label>
                <div className="flex items-center gap-4">
                  <img src={localSettings.paymentDetails.qrCodeUrl} className="w-20 h-20 object-cover rounded border border-slate-700" alt="QR Preview" />
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
             <h3 className="text-xl font-bold mb-6">Credit Packages</h3>
             <div className="space-y-4">
                {localSettings.creditPackages.map((pkg, idx) => (
                  <div key={pkg.id} className="flex items-center gap-2 bg-slate-950 p-3 rounded border border-slate-800">
                    <input 
                      value={pkg.name}
                      onChange={(e) => {
                        const newPkgs = [...localSettings.creditPackages];
                        newPkgs[idx].name = e.target.value;
                        setLocalSettings({...localSettings, creditPackages: newPkgs});
                      }}
                      className="bg-transparent border-none text-white w-full focus:ring-0"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Cr:</span>
                      <input 
                        type="number"
                        value={pkg.credits}
                        onChange={(e) => {
                          const newPkgs = [...localSettings.creditPackages];
                          newPkgs[idx].credits = parseInt(e.target.value);
                          setLocalSettings({...localSettings, creditPackages: newPkgs});
                        }}
                        className="bg-slate-800 w-16 text-center rounded text-white text-sm py-1"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">{CURRENCY_SYMBOL}</span>
                      <input 
                        type="number"
                        value={pkg.price}
                        onChange={(e) => {
                          const newPkgs = [...localSettings.creditPackages];
                          newPkgs[idx].price = parseInt(e.target.value);
                          setLocalSettings({...localSettings, creditPackages: newPkgs});
                        }}
                        className="bg-slate-800 w-16 text-center rounded text-white text-sm py-1"
                      />
                    </div>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="lg:col-span-2 flex justify-end">
            <Button onClick={handleSettingsSave} className="px-8">Save All Changes</Button>
          </div>
        </div>
      )}
    </div>
  );
};
