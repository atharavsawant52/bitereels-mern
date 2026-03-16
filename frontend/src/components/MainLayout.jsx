import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

const MainLayout = ({ children }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(251,93,71,0.16),_transparent_24%),linear-gradient(180deg,#050816_0%,#02040a_100%)] text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 pt-2 md:ml-[260px] md:pt-0 md:pb-8">
                <div className="mx-auto min-h-screen w-full max-w-[1180px] rounded-[32px] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.5),rgba(2,6,23,0.35))] shadow-[0_32px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    {children}
                </div>
            </main>
            <BottomNav />
        </div>
    );
};

export default MainLayout;
