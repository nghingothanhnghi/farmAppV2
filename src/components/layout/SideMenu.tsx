// src/components/layout/SideMenu.tsx
import { APP_NAME } from '../../config/constants';
import Header from './Header';
import Footer from './Footer';
import { menuItems } from '../../config/menu';
import MultiLevelMenu from './MultiLevelMenu';

interface SideMenuProps {
    open?: boolean;
    onClose?: () => void;
}
export default function SideMenu({ open = false, onClose }: SideMenuProps) {
    // Only close on mobile
    const handleLinkClick = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            onClose?.();
        }
    };
    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 lg:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />
            <aside
                className={`
                    fixed inset-y-0 left-0 z-30 w-64
                    bg-white dark:bg-zinc-900 lg:bg-transparent lg:dark:bg-transparent
                    transition-all duration-300 ease-in-out
                    transform opacity-100
                    ${open ? 'translate-x-0 opacity-100 will-change-[transform,opacity]' : 'lg:-translate-x-64 -translate-x-full opacity-0 pointer-events-none'}

                `}
            >
                <div className='flex h-full min-h-0 flex-col'>
                    <Header appName={APP_NAME} onClose={onClose} />
                    <div className="flex flex-1 flex-col overflow-y-auto p-4 space-y-0.5">
                        <MultiLevelMenu
                            items={menuItems}
                            mobile={true}
                            onNavigate={handleLinkClick}
                        />
                    </div>
                    <Footer />
                </div>
            </aside>
        </>

    );
}
