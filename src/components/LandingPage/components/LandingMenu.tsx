// src/pages/components/LandingMenu.tsx
import React, { useRef, useState, useEffect } from 'react';
import { IconLayoutSidebarLeftExpand, IconX, IconHome } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { useSidebar } from '../../../hooks/useSidebar';
import { useScrollToSection } from '../../../hooks/useScrollToSection';
import { useAutoHideNavbar } from '../../../hooks/useAutoHideNavbar';

import ListLink from '../../common/ListLink';

const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'features', label: 'Features' },
    { id: 'setup', label: 'Easy Setup' },
    { id: 'shop', label: 'Shop' },
];

const LandingMenu: React.FC = () => {
    const { menuOpen, setMenuOpen } = useSidebar(false, false);
    const navigate = useNavigate();
    const scrollToSection = useScrollToSection({
        offset: 64, // height of fixed navbar
        onAfterScroll: () => {
            if (window.innerWidth < 1024) setMenuOpen(false);
        },
    });

    // 👇 use reusable hook here
    const { showNavbar, showNow } = useAutoHideNavbar('hero', 80);

    // Track which section is active
    const [activeSection, setActiveSection] = useState('hero');
    const [indicator, setIndicator] = useState({ left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Observe visible section on scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.find((e) => e.isIntersecting);
                if (visible) setActiveSection(visible.target.id);
            },
            { threshold: 0.6 }
        );

        sections.forEach((sec) => {
            const el = document.getElementById(sec.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    // Update underline indicator when activeSection changes
    useEffect(() => {
        if (!containerRef.current) return;
        const activeEl = containerRef.current.querySelector<HTMLAnchorElement>(
            `a[data-id="${activeSection}"]`
        );
        if (activeEl) {
            const rect = activeEl.getBoundingClientRect();
            const parentRect = containerRef.current.getBoundingClientRect();
            setIndicator({
                left: rect.left - parentRect.left,
                width: rect.width,
            });
        }
    }, [activeSection]);

    return (
        <>
            {/* --- Top Nav --- */}
            <AnimatePresence>
                {showNavbar && (
                    <motion.nav
                        key="navbar"
                        initial={{ y: -80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -80, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="
              fixed top-0 left-0 right-0 z-50
              bg-gradient-to-l from-white/70 to-transparent 
              dark:from-zinc-900/80 dark:to-transparent
              backdrop-blur-md border-b border-zinc-200 dark:border-zinc-700"
                    >
                        <div className='mx-auto max-w-6xl flex justify-between items-center px-6 py-3'>
                            <div
                                className="text-xl font-bold cursor-pointer select-none"
                                onClick={() => scrollToSection('hero')}
                            >
                                MyBrand
                            </div>

                            {/* Desktop Menu */}
                            <div ref={containerRef} className="hidden relative lg:flex items-center space-x-2">
                                {sections.map((sec) => (
                                    <ListLink
                                        backgroundMode="off"
                                        key={sec.id}
                                        to="#"
                                        label={sec.label}
                                        active={activeSection === sec.id}
                                        onClick={() => {
                                            setActiveSection(sec.id);
                                            scrollToSection(sec.id);
                                            showNow(); // ✅ force open navbar when clicking
                                        }}
                                        // Add data-id for measuring position
                                        {...{ 'data-id': sec.id }}
                                    />
                                ))}

                                {/* Animated underline */}
                                <motion.div
                                    className="absolute bottom-0 h-[2px] bg-orange-500 rounded-full"
                                    animate={{
                                        left: indicator.left,
                                        width: indicator.width,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 25,
                                    }}
                                />

                                <ListLink
                                    to="/admin/dashboard"
                                    label="Dashboard"
                                />
                            </div>

                            {/* Mobile Toggle */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                {menuOpen ? <IconX size={22} /> : <IconLayoutSidebarLeftExpand size={22} />}
                            </button>
                        </div>

                    </motion.nav>
                )}
            </AnimatePresence>

            {/* --- Mobile Menu --- */}
            {menuOpen && (
                <div className="fixed top-[64px] left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700 flex flex-col items-center gap-3 py-4 z-40">
                    {sections.map((sec) => (
                        <div
                            key={sec.id}
                            onClick={() => {
                                scrollToSection(sec.id);
                                showNow(); // ✅ ensure navbar reappears after clicking
                            }}
                        >
                            <ListLink
                                to="#"
                                label={sec.label}
                                active={false}
                            />
                        </div>
                    ))}

                    <div onClick={() => navigate('/admin/dashboard')}>
                        <ListLink
                            to="/admin/dashboard"
                            label="Dashboard"
                            icon={<IconHome />}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default LandingMenu;
