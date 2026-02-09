import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

const MainLayout = ({ children }) => {
    return (
        <div className="flex bg-black min-h-screen text-white">
            {/* Left Sidebar (Desktop/Tablet) */}
            <Sidebar />

            {/* Main Content Area - Centered Reel Feed */}
            <main className="flex-1 md:ml-16 xl:ml-[244px] flex justify-center w-full">
                <div className="w-full max-w-[470px] relative"> 
                    {children}
                </div>
            </main>

            {/* Bottom Nav (Mobile) */}
            <BottomNav />
        </div>
    );
};

export default MainLayout;
