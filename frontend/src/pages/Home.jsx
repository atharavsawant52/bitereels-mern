import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReelFeed from '../components/ReelFeed';

const Home = () => {
    const { user, logout } = useAuth();

    return (
        <>
            {/* Reel Feed */}
            <ReelFeed />
        </>
    );
};

export default Home;
