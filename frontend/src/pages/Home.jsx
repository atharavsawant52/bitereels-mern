import ReelFeed from '../components/ReelFeed';

const Home = () => {
    return (
        <div className="flex h-[100dvh] w-full justify-center overflow-hidden px-0">
            <div className="h-full w-full max-w-full">
                <ReelFeed />
            </div>
        </div>
    );
};

export default Home;
