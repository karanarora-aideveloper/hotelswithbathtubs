'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  addTracker, updateTrackerStatus, deleteTracker,
  addSubCampaign, updateSubCampaignStatus, deleteSubCampaign, 
  updateTrackerTargetedCountries, updateSubCampaignTargetedCountries
} from '@/app/admin/affiliates/actions';

function DebouncedInput({ 
  initialValue, 
  onSave, 
  placeholder 
}: { 
  initialValue: string, 
  onSave: (val: string) => void,
  placeholder?: string 
}) {
  const [val, setVal] = useState(initialValue || '');
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setVal(initialValue || ''); }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onSave(e.target.value);
    }, 500);
  };

  return (
    <input 
      type="text" 
      value={val} 
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-transparent transition-all"
    />
  );
}

export default function AffiliateTrackerClient({ trackers }: { trackers: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Affiliate Application Tracker</h2>
          <p className="text-gray-500 mt-1">Manage your active applications to various affiliate programs.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {isAdding ? 'Cancel' : '+ Add Program'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 relative group">
        <h3 className="text-blue-900 font-bold mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Your Affiliate Pitch Template
        </h3>
        <p className="text-blue-800 text-sm leading-relaxed pr-24" id="pitch-text">
          Hotels with Bathtubs is a premium travel directory tailored for couples seeking romantic getaways. We rigorously cross-verify hotel amenities across MakeMyTrip, Agoda, and Booking.com to guarantee that every listed property features a private in-room bathtub or jacuzzi. By solving a major pain point—inaccurate hotel amenity listings—we attract a highly targeted audience with strong booking intent, resulting in excellent conversion rates for our OTA partners.
        </p>
        <button 
          onClick={(e) => {
            const text = document.getElementById('pitch-text')?.innerText;
            if (text) {
              navigator.clipboard.writeText(text);
              const target = e.currentTarget as HTMLButtonElement;
              const originalText = target.innerText;
              target.innerText = 'Copied!';
              setTimeout(() => { target.innerText = originalText; }, 2000);
            }
          }}
          className="absolute top-6 right-6 bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
        >
          Copy Pitch
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Affiliate Program</h3>
          <form action={async (formData) => {
            await addTracker(formData);
            setIsAdding(false);
          }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Platform Name</label>
              <input name="platformName" required type="text" placeholder="e.g. Awin, CJ Affiliate" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Portal URL</label>
              <input name="url" required type="url" placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select name="status" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none">
                <option value="Researching">Researching</option>
                <option value="Applied">Applied</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Applied Date</label>
              <input name="appliedDate" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Partners / Websites</label>
              <input name="supportedBrands" type="text" placeholder="e.g. Booking.com, Expedia" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Targeted Countries</label>
              <input name="targetedCountries" type="text" placeholder="e.g. India, UK, Global" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Commission Rate</label>
              <input name="commissionRate" type="text" placeholder="e.g. 5% or $10/booking" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
              <input name="notes" type="text" placeholder="Requirements, contacts..." className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
            </div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">Save Program</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 w-10"></th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Platform</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Partners / Websites</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700 w-48">Targeted Countries</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Commission</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Applied Date</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trackers.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No programs tracked yet.</td></tr>
            ) : trackers.map((t) => (
              <React.Fragment key={t._id}>
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={(e) => {
                  if ((e.target as HTMLElement).tagName !== 'SELECT' && (e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'A' && (e.target as HTMLElement).tagName !== 'INPUT') {
                    toggleRow(t._id);
                  }
                }}>
                  <td className="px-4 py-4 text-gray-400">
                    <svg className={`w-5 h-5 transition-transform ${expandedRows[t._id] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </td>
                  <td className="px-6 py-4">
                    <a href={t.url} target="_blank" rel="noopener noreferrer" className="font-bold text-accent hover:underline">
                      {t.platformName}
                    </a>
                    {t.notes && <p className="text-xs text-gray-500 mt-1">{t.notes}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {t.supportedBrands ? (
                      <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-gray-200 line-clamp-2" title={t.supportedBrands}>
                        {t.supportedBrands.split(',').length} Partners
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <DebouncedInput 
                      initialValue={t.targetedCountries} 
                      onSave={(val) => updateTrackerTargetedCountries(t._id, val)} 
                      placeholder="e.g. UK, Global"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{t.commissionRate || '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{t.appliedDate ? new Date(t.appliedDate).toISOString().split('T')[0] : '-'}</td>
                  <td className="px-4 py-4">
                    <select 
                      value={t.status} 
                      onChange={(e) => updateTrackerStatus(t._id, e.target.value as 'Researching' | 'Applied' | 'In Review' | 'Approved' | 'Rejected')}
                      className={`text-sm border rounded px-2 py-1 outline-none font-medium ${
                        t.status === 'Approved' ? 'bg-green-50 border-green-200 text-green-700' : 
                        t.status === 'Applied' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                        t.status === 'In Review' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        t.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                        'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <option value="Researching">Researching</option>
                      <option value="Applied">Applied</option>
                      <option value="In Review">In Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this program?')) deleteTracker(t._id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>

                {/* Sub Campaigns Expanded Row */}
                {expandedRows[t._id] && (
                  <tr className="bg-gray-50 border-b border-gray-200 shadow-inner">
                    <td colSpan={8} className="px-6 py-4 pl-14">
                      <div className="mb-4">
                        <h4 className="text-sm font-bold text-gray-700 mb-2">Advertiser Campaigns under {t.platformName}</h4>
                        {t.subCampaigns && t.subCampaigns.length > 0 ? (
                          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-2 font-semibold text-gray-600">Campaign Name</th>
                                  <th className="px-4 py-2 font-semibold text-gray-600 w-48">Targeted Countries</th>
                                  <th className="px-4 py-2 font-semibold text-gray-600">Applied Date</th>
                                  <th className="px-4 py-2 font-semibold text-gray-600">Status</th>
                                  <th className="px-4 py-2 text-right font-semibold text-gray-600">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {t.subCampaigns.map((sub: any) => (
                                  <tr key={sub._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium text-gray-800">{sub.name}</td>
                                    <td className="px-4 py-2">
                                      <DebouncedInput 
                                        initialValue={sub.targetedCountries} 
                                        onSave={(val) => updateSubCampaignTargetedCountries(t._id, sub._id, val)} 
                                        placeholder="e.g. India"
                                      />
                                    </td>
                                    <td className="px-4 py-2 text-gray-600">{sub.appliedDate ? new Date(sub.appliedDate).toISOString().split('T')[0] : '-'}</td>
                                    <td className="px-4 py-2">
                                      <select 
                                        value={sub.status} 
                                        onChange={(e) => updateSubCampaignStatus(t._id, sub._id, e.target.value as 'Researching' | 'Applied' | 'In Review' | 'Approved' | 'Rejected')}
                                        className={`text-xs border rounded px-2 py-1 outline-none font-medium ${
                                          sub.status === 'Approved' ? 'bg-green-50 border-green-200 text-green-700' : 
                                          sub.status === 'Applied' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                          sub.status === 'In Review' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                          sub.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                                          'bg-gray-50 border-gray-200 text-gray-700'
                                        }`}
                                      >
                                        <option value="Researching">Researching</option>
                                        <option value="Applied">Applied</option>
                                        <option value="In Review">In Review</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                      </select>
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                      <button 
                                        onClick={() => {
                                          if (confirm('Delete sub-campaign?')) deleteSubCampaign(t._id, sub._id);
                                        }}
                                        className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No sub-campaigns tracked yet.</p>
                        )}
                      </div>

                      {/* Add Sub Campaign Form */}
                      <form action={async (formData) => {
                        await addSubCampaign(t._id, formData);
                        const form = document.getElementById(`form-${t._id}`) as HTMLFormElement;
                        if(form) form.reset();
                      }} id={`form-${t._id}`} className="flex items-end gap-3 mt-4 bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex-grow">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">New Campaign Name</label>
                          <input name="name" required type="text" placeholder="e.g. Trip.com" className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                          <select name="status" className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded outline-none">
                            <option value="Researching">Researching</option>
                            <option value="Applied">Applied</option>
                            <option value="In Review">In Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                          <input name="appliedDate" type="date" className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded outline-none" />
                        </div>
                        <button type="submit" className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-gray-800 transition-colors h-[34px]">
                          Add
                        </button>
                      </form>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
