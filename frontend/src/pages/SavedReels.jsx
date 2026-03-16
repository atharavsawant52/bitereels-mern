import { useEffect, useState } from 'react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

const SavedReels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSaved = async () => {
    try {
      const { data } = await api.get('/api/reels/saved');
      if (data.success) {
        setReels(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const removeSaved = async (id) => {
    try {
      await api.put(`/api/reels/${id}/save`, {});
      setReels(prev => prev.filter(r => r._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-heading font-bold mb-4">Saved Reels</h1>
        {reels.length === 0 ? (
          <p className="text-gray-400">No saved reels yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {reels.map(reel => (
              <div key={reel._id} className="relative group rounded-xl overflow-hidden border border-white/10">
                <video
                  src={`${apiUrl}${reel.videoUrl}`}
                  className="w-full aspect-[9/16] object-cover opacity-80 group-hover:opacity-100 transition"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{reel.title}</p>
                    <p className="text-xs text-gray-400">₹{reel.price}</p>
                  </div>
                  <button
                    onClick={() => removeSaved(reel._id)}
                    className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded-md px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
                <button
                  onClick={() => navigate(`/restaurant/${reel.restaurant?._id}`)}
                  className="absolute top-2 left-2 bg-black/50 text-xs px-2 py-1 rounded-md border border-white/10"
                >
                  {reel.restaurant?.restaurantDetails?.restaurantName || reel.restaurant?.username}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedReels;
