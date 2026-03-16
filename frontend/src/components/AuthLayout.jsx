import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlayCircle, FaUtensils, FaBolt } from 'react-icons/fa';

const marketingLines = [
    'Discover food through reels',
    'Scroll. Watch. Order.',
    'Restaurants showcase their dishes with short videos'
];

const floatingBadges = [
    { label: '50+ restaurants', className: 'right-10 top-28' },
    { label: 'Instant ordering', className: 'left-16 bottom-24' }
];

const glowShapes = [
    'left-[8%] top-[10%] h-44 w-44 bg-orange-500/18',
    'right-[12%] top-[18%] h-64 w-64 bg-cyan-500/12',
    'left-[24%] bottom-[10%] h-56 w-56 bg-rose-500/14',
    'right-[20%] bottom-[16%] h-40 w-40 bg-amber-400/12'
];

const AuthLayout = ({ eyebrow, title, subtitle, formTitle, formSubtitle, children, footer }) => {
    const [lineIndex, setLineIndex] = useState(0);
    const [visibleText, setVisibleText] = useState('');
    const activeLine = useMemo(() => marketingLines[lineIndex], [lineIndex]);

    useEffect(() => {
        let typingTimeout;
        let pauseTimeout;

        if (visibleText.length < activeLine.length) {
            typingTimeout = window.setTimeout(() => {
                setVisibleText(activeLine.slice(0, visibleText.length + 1));
            }, 55);
        } else {
            pauseTimeout = window.setTimeout(() => {
                setVisibleText('');
                setLineIndex((current) => (current + 1) % marketingLines.length);
            }, 1700);
        }

        return () => {
            window.clearTimeout(typingTimeout);
            window.clearTimeout(pauseTimeout);
        };
    }, [activeLine, visibleText]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(251,93,71,0.18),_transparent_22%),linear-gradient(180deg,#050816_0%,#02040a_100%)] text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />
                {glowShapes.map((shape) => (
                    <motion.div
                        key={shape}
                        className={`absolute rounded-full blur-3xl ${shape}`}
                        animate={{ y: [0, -24, 0], x: [0, 18, 0], scale: [1, 1.08, 1] }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ))}
                <motion.div
                    className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl"
                    animate={{ scale: [1, 1.16, 1], opacity: [0.45, 0.72, 0.45] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            <div className="relative mx-auto grid min-h-screen max-w-[1440px] items-center gap-10 px-4 py-6 md:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(440px,560px)] lg:px-10 xl:px-14">
                <section className="relative hidden min-h-[760px] overflow-hidden rounded-[40px] border border-white/8 bg-[linear-gradient(180deg,rgba(6,11,30,0.92),rgba(2,6,23,0.74))] p-10 shadow-[0_30px_120px_rgba(0,0,0,0.38)] lg:flex lg:flex-col lg:justify-between">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,93,71,0.12),_transparent_36%)]" />

                    {floatingBadges.map((badge, index) => (
                        <motion.div
                            key={badge.label}
                            className={`absolute ${badge.className} rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 backdrop-blur-xl`}
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4 + index, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            {badge.label}
                        </motion.div>
                    ))}

                    <div className="relative z-10 max-w-[34rem]">
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55 }}
                            className="text-xs font-semibold uppercase tracking-[0.38em] text-slate-400"
                        >
                            {eyebrow}
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.05 }}
                            className="mt-6 max-w-[12ch] font-heading text-6xl font-black leading-[0.98] tracking-tight text-white"
                        >
                            {title}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.12 }}
                            className="mt-6 max-w-[34rem] text-lg leading-8 text-slate-300"
                        >
                            {subtitle}
                        </motion.p>
                    </div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.65, delay: 0.18 }}
                            className="rounded-[32px] border border-white/10 bg-black/25 p-7 backdrop-blur-2xl"
                        >
                            <div className="flex items-center gap-3 text-primary">
                                <FaPlayCircle size={18} />
                                <div className="h-px flex-1 bg-gradient-to-r from-primary/60 to-transparent" />
                            </div>
                            <p className="mt-6 min-h-[42px] text-[1.75rem] font-black tracking-tight text-white">
                                {visibleText}
                                <span className="ml-1 inline-block h-7 w-[2px] animate-pulse bg-primary align-middle" />
                            </p>
                            <div className="mt-8 grid gap-4 md:grid-cols-3">
                                <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                                    <FaUtensils className="text-primary" />
                                    <p className="mt-3 text-sm font-semibold text-white">Short-form menus</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">Turn craving into checkout with rich, vertical food stories.</p>
                                </div>
                                <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                                    <FaBolt className="text-amber-300" />
                                    <p className="mt-3 text-sm font-semibold text-white">Fast discovery</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">Users keep scrolling, restaurants keep converting, and orders stay instant.</p>
                                </div>
                                <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                                    <FaPlayCircle className="text-cyan-300" />
                                    <p className="mt-3 text-sm font-semibold text-white">Built for reels</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">Every dish gets a premium showcase with mobile-first motion and clarity.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="relative flex min-h-screen items-center justify-center py-6 lg:min-h-0">
                    <div className="pointer-events-none absolute inset-0 hidden lg:block">
                        <motion.div
                            className="absolute left-6 top-24 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 backdrop-blur-xl"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            Instant ordering
                        </motion.div>
                        <motion.div
                            className="absolute bottom-28 right-6 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 backdrop-blur-xl"
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            Premium discovery
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 28, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="relative w-full max-w-[560px]"
                    >
                        <div className="absolute inset-0 rounded-[36px] bg-[linear-gradient(135deg,rgba(251,93,71,0.55),rgba(56,189,248,0.18),rgba(255,255,255,0.06))] p-[1px]" />
                        <div className="relative rounded-[36px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.88))] px-6 py-8 shadow-[0_28px_100px_rgba(0,0,0,0.45),0_0_80px_rgba(251,93,71,0.12)] backdrop-blur-2xl sm:px-8 sm:py-10">
                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.08 }}
                                className="mb-8 text-center"
                            >
                                <p className="text-[10px] font-black uppercase tracking-[0.42em] text-slate-500">{formTitle}</p>
                                <h2 className="mt-4 font-heading text-4xl font-black tracking-tight text-white sm:text-[2.9rem]">
                                    {formSubtitle}
                                </h2>
                            </motion.div>
                            {children}
                            {footer}
                        </div>
                    </motion.div>
                </section>
            </div>
        </div>
    );
};

export default AuthLayout;
