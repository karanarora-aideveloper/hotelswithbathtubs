'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function AdminPinterestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [pinTitle, setPinTitle] = useState('');
  const [pinDescription, setPinDescription] = useState('');
  const [pinLink, setPinLink] = useState('');
  const [pinImage, setPinImage] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPinterestData();
  }, []);

  const fetchPinterestData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/pinterest');
      const json = await res.json();
      setData(json);

      if (json.boards && json.boards.length > 0) {
        const defaultBoard = json.boards.find((b: any) => b.name.includes('Hotels with Bathtubs')) || json.boards[0];
        setSelectedBoard(defaultBoard.id);
      }

      if (json.hotels && json.hotels.length > 0) {
        selectHotel(json.hotels[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectHotel = (hotel: any) => {
    setSelectedHotel(hotel);
    const citySlug = (hotel.city || '').toLowerCase().replace(/\s+/g, '-');
    const countrySlug = (hotel.country || 'india').toLowerCase().replace(/\s+/g, '-');
    const destUrl = `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}?utm_source=pinterest&utm_medium=social&utm_campaign=pin_${citySlug}`;

    setPinTitle(`${hotel.name} - Luxury Bathtub Suite in ${hotel.city}`);
    setPinDescription(`Looking for a romantic stay in ${hotel.city}? ${hotel.name} features private in-room soaking bathtubs and jacuzzi suites hand-verified for couples. Plan your romantic escape on HotelsWithBathtubs.com.`);
    setPinLink(destUrl);
    setPinImage(hotel.image);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoard || !pinImage) return;

    setPublishing(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/pinterest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: selectedBoard,
          title: pinTitle,
          description: pinDescription,
          link: pinLink,
          imageUrl: pinImage,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setStatusMessage({
          type: 'error',
          text: result.error || 'Failed to publish Pin. (Note: Trial access requires Standard Access upgrade for production pins).',
        });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Pin published successfully! Pin ID: ${result.pin?.id}`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message,
      });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
        Loading Pinterest Studio...
      </div>
    );
  }

  const isConnected = data?.connected;
  const user = data?.user;
  const boards = data?.boards || [];
  const hotels = data?.hotels || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📌</span>
            <h1 className="text-3xl font-extrabold text-gray-900">Pinterest Studio</h1>
          </div>
          <p className="text-gray-500 mt-1">
            Automated content syndication &amp; visual discovery for HotelsWithBathtubs.com
          </p>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-xs">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <div className="text-xs font-bold text-gray-800">Connected: @{user?.username}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">{user?.account_type || 'Business'} Account</div>
            </div>
          </div>
        ) : (
          <a
            href="https://www.pinterest.com/oauth/?client_id=1608445&redirect_uri=http%3A%2F%2Flocalhost%3A8085%2Fcallback&response_type=code&scope=boards%3Aread%2Cboards%3Awrite%2Cpins%3Aread%2Cpins%3Awrite%2Cuser_accounts%3Aread"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors"
          >
            Connect Pinterest Account
          </a>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Select & Edit Pin */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Publish or Schedule a Pin</h2>

          {statusMessage && (
            <div
              className={`p-4 rounded-xl text-sm font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-amber-50 border border-amber-200 text-amber-900'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handlePublish} className="space-y-5">
            {/* Board Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Pinterest Board</label>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white text-sm"
              >
                {boards.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.privacy})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Hotel Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Choose Hotel to Pin</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50">
                {hotels.map((h: any) => (
                  <button
                    key={h._id}
                    type="button"
                    onClick={() => selectHotel(h)}
                    className={`text-left p-2 rounded-lg text-xs transition-all flex flex-col items-center ${
                      selectedHotel?._id === h._id
                        ? 'bg-red-50 border-2 border-red-500 shadow-xs'
                        : 'bg-white border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="relative w-full h-16 rounded overflow-hidden mb-1.5">
                      <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold text-gray-900 line-clamp-1 w-full text-center">{h.name}</span>
                    <span className="text-[10px] text-gray-500">{h.city}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pin Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pin Title (Max 100 chars)</label>
              <input
                type="text"
                value={pinTitle}
                onChange={(e) => setPinTitle(e.target.value)}
                maxLength={100}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
              />
            </div>

            {/* Pin Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pin Description (SEO &amp; Hashtags)</label>
              <textarea
                rows={3}
                value={pinDescription}
                onChange={(e) => setPinDescription(e.target.value)}
                maxLength={500}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
              ></textarea>
            </div>

            {/* Destination Link */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Destination Link (Includes UTM tracking)</label>
              <input
                type="url"
                value={pinLink}
                onChange={(e) => setPinLink(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm font-mono text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={publishing}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {publishing ? 'Publishing...' : 'Publish Pin to Pinterest'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Pin Preview */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Live Pin Preview</h3>

            <div className="bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 max-w-sm mx-auto shadow-sm">
              <div className="relative aspect-[2/3] w-full bg-gray-200">
                {pinImage ? (
                  <img src={pinImage} alt="Pin Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No Image Selected</div>
                )}
                <div className="absolute top-3 right-3 bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
                  Save
                </div>
              </div>
              <div className="p-4 bg-white">
                <h4 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 mb-1.5">{pinTitle}</h4>
                <p className="text-xs text-gray-600 line-clamp-3 mb-3">{pinDescription}</p>
                <div className="flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100 pt-2 font-mono">
                  <span className="truncate">hotelswithbathtubs.com</span>
                  <span className="text-red-600 font-semibold">Visit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
