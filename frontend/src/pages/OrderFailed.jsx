import { useNavigate } from 'react-router-dom';

const OrderFailed = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
                <p className="text-gray-400 mb-6">Your payment could not be verified. Please try again.</p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/cart')}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-full font-semibold"
                    >
                        Back to Cart
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-full font-semibold transition"
                    >
                        Continue Browsing
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderFailed;
