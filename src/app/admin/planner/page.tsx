'use client';

import { useState, useEffect } from 'react';

export default function AdminPlannerPage() {
  const [tasks, setTasks] = useState([]);
  const [existingLocations, setExistingLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCity, setNewCity] = useState('');
  const [newCountry, setNewCountry] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/planner');
      const data = await res.json();
      setTasks(data.tasks || []);
      setExistingLocations(data.existingLocations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity || !newCountry) return;
    try {
      await fetch('/api/admin/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: newCity, country: newCountry }),
      });
      setNewCity('');
      setNewCountry('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/planner/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Expansion Planner</h1>
        <p className="text-gray-500 mt-2">Schedule and track new cities and countries to scrape for your global expansion.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column: Form & Live Stats */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Queue New Location</h3>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                <input 
                  type="text" 
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none"
                  placeholder="e.g. France"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                <input 
                  type="text" 
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none"
                  placeholder="e.g. Paris"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Add to Schedule
              </button>
            </form>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Live Locations</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <ul className="divide-y divide-gray-100">
                {loading ? (
                  <li className="px-6 py-4 text-sm text-gray-500 text-center">Loading...</li>
                ) : existingLocations.length === 0 ? (
                  <li className="px-6 py-4 text-sm text-gray-500 text-center">No locations scraped yet.</li>
                ) : existingLocations.map((loc: any, i) => (
                  <li key={i} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{loc.city}</p>
                      <p className="text-xs text-gray-500">{loc.country}</p>
                    </div>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">
                      {loc.hotelCount} Hotels
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Planner Table */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-fit">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">Planned Location</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">No planned expansions.</td></tr>
              ) : tasks.map((task: any) => (
                <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{task.city}</p>
                    <p className="text-xs text-gray-500">{task.country}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select 
                      value={task.status}
                      onChange={(e) => updateStatus(task._id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 outline-none bg-white cursor-pointer"
                    >
                      <option value="planned">Planned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
