import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const RestaurantDetail = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/restaurants/${id}`);
                setRestaurant(data);
            } catch (error) {
                console.error("Error fetching restaurant", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [id]);

    const addToCart = async (foodItemId, price) => {
        try {
            await axios.post('http://localhost:5000/api/cart', {
                foodItemId,
                quantity: 1
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            alert("Added to cart");
        } catch (error) {
            console.error("Add to cart failed", error);
        }
    };

    if (loading) return <div className="text-center p-10">Loading...</div>;
    if (!restaurant) return <div className="text-center p-10">Restaurant not found</div>;

    return (
        <div className="min-h-screen bg-dark pb-20">
            {/* Header Image */}
            <div className="h-48 bg-gray-700 relative">
                {restaurant.image && (
                     <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-end p-4">
                    <h1 className="text-3xl font-heading font-bold text-white">{restaurant.name}</h1>
                </div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-300 mb-2">{restaurant.description}</p>
                        <div className="flex items-center text-gray-400 text-sm gap-2">
                             <FaMapMarkerAlt />
                             <span>{restaurant.address}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                        <FaStar className="text-yellow-400" />
                        <span className="font-bold">{restaurant.rating || 'New'}</span>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-primary mb-4 border-b border-gray-700 pb-2">Menu</h2>
                
                <div className="space-y-4">
                    {restaurant.menu?.map(item => (
                        <div key={item._id} className="bg-secondary p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{item.name}</h3>
                                <p className="text-sm text-gray-400 mb-1">{item.description}</p>
                                <p className="text-primary font-bold">${item.price}</p>
                            </div>
                            <button 
                                onClick={() => addToCart(item._id, item.price)}
                                className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-red-500"
                            >
                                Add
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetail;
