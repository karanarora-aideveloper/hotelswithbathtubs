'use client';

import { useState, useEffect } from 'react';

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    fetchHotels();
  }, [search, status]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, status }).toString();
      const res = await fetch(`/api/admin/hotels?${query}`);
      const data = await res.json();
      setHotels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/hotels/${id}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagged: !currentStatus }),
      });
      fetchHotels(); // Refresh
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hotel Data Management</h1>
        <p className="text-gray-500 mt-2">Verify and flag scraped hotels. Flagged hotels will not appear on the live site.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
          <input 
            type="text"
            placeholder="Search by hotel name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none text-sm"
          />
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none text-sm bg-white"
          >
            <option value="all">All Hotels</option>
            <option value="active">Active Only</option>
            <option value="flagged">Flagged Only</option>
          </select>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">Hotel Name</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
            ) : hotels.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No hotels found.</td></tr>
            ) : hotels.map((hotel: any) => (
              <tr key={hotel._id} className={hotel.flagged ? 'bg-red-50 opacity-75' : 'hover:bg-gray-50'}>
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">{hotel.name}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">{hotel.city}, {hotel.country}</td>
                <td className="px-6 py-4">
                  {hotel.flagged ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Flagged</span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => toggleFlag(hotel._id, hotel.flagged)}
                    className={`font-medium text-sm px-3 py-1 rounded ${hotel.flagged ? 'text-gray-600 hover:bg-gray-200' : 'text-red-600 hover:bg-red-50'}`}
                  >
                    {hotel.flagged ? 'Unflag' : 'Flag (Remove)'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
