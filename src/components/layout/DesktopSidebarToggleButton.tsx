// src/components/layout/DesktopSidebarToggleButton.tsx
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { IconLayoutSidebarLeftExpand, IconDeviceGamepad3, IconLogout, IconUserEdit } from '@tabler/icons-react';
import Button from '../common/Button';
import DropdownButton from '../common/DropdownButton';
import ListLink from '../common/ListLink';
import Avatar from '../common/Avatar';
import CartButton from '../common/cart/CartButton';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/authContext';
import { menuItems } from '../../config/menu';
import type { MenuItem } from '../../config/menu';
import MultiLevelMenu from './MultiLevelMenu';

interface DesktopSidebarToggleButtonProps {
    onClick: () => void;
    className?: string;
}

const DesktopSidebarToggleButton: React.FC<DesktopSidebarToggleButtonProps> = ({
    onClick,
    className = '',
}) => {
    const { t } = useTranslation();
    const [hovered, setHovered] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const flyoutRef = useRef<HTMLDivElement>(null);

    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearCloseTimer = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    };

    const handleRegionLeave = () => {
        clearCloseTimer();

        closeTimer.current = setTimeout(() => {
            const isSidebarHovered =
                sidebarRef.current?.matches(':hover') ?? false;

            const isFlyoutHovered =
                flyoutRef.current?.matches(':hover') ?? false;

            if (!isSidebarHovered && !isFlyoutHovered) {
                setActiveItem(null);
                setMenuPosition(null);
            }
        }, 200);
    };

    const handleItemMouseEnter = (
        item: MenuItem,
        element: HTMLDivElement
    ) => {
        clearCloseTimer();

        if (!item.children?.length) {
            setActiveItem(null);
            setMenuPosition(null);
            return;
        }

        const rect = element.getBoundingClientRect();

        setActiveItem(item);
        setMenuPosition({
            top: rect.top,
            left: rect.right,
        });
    };

    React.useEffect(() => {
        return () => {
            clearCloseTimer();
        };
    }, []);

    return (
        <div className={`hidden lg:flex lg:flex-col fixed top-0 left-4 z-20 bg-transparent h-full min-h-0 ${className}`}
            ref={sidebarRef}
            onMouseLeave={handleRegionLeave}
            onMouseEnter={clearCloseTimer}
        >
            <Button
                variant="secondary"
                icon={
                    <span className="transition-transform duration-300 ease-in-out">
                        {hovered ? (
                            <IconLayoutSidebarLeftExpand size={18} />
                        ) : (
                            <IconDeviceGamepad3 size={18} className="text-orange-600" />
                        )}
                    </span>
                }
                iconOnly
                rounded='full'
                label="Close"
                className={`bg-transparent mt-4`}
                onClick={onClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            />
            <div className="flex flex-1 flex-col overflow-y-auto space-y-0.5 pt-8">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem?.id === item.id;

                    return (
                        <div
                            key={item.id}
                            className="relative"
                            onMouseEnter={(e) =>
                                handleItemMouseEnter(item, e.currentTarget)
                            }
                        >
                            <div
                                className={`flex items-center justify-center rounded-lg transition-colors ${isActive
                                    ? 'bg-gray-100 dark:bg-zinc-800'
                                    : ''
                                    }`}
                            >
                                {item.to ? (
                                    <ListLink
                                        to={item.to}
                                        icon={Icon ? <Icon size={16} /> : undefined}
                                        label={t(item.label)}
                                        iconOnlyMode
                                    />
                                ) : (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        icon={Icon ? <Icon size={16} /> : undefined}
                                        iconOnly
                                        label={t(item.label)}
                                        rounded="lg"
                                        size="sm"
                                        className="bg-transparent"
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {activeItem?.children?.length && menuPosition &&
                createPortal(
                    <div
                        ref={flyoutRef}
                        className="fixed z-[100] pl-2"
                        style={{
                            top: menuPosition.top,
                            left: menuPosition.left,
                        }}
                        onMouseEnter={clearCloseTimer}
                        onMouseLeave={handleRegionLeave}
                    >
                        <div
                            className="
                    w-64 max-h-[calc(100vh-2rem)]
                    overflow-y-auto
                    rounded-xl border border-gray-200
                    bg-white p-3 shadow-xl
                    dark:border-white/10
                    dark:bg-zinc-900
                "
                        >
                            <div className="mb-2 flex items-center gap-2 border-b border-gray-100 px-2 pb-3 text-sm font-semibold text-gray-800 dark:border-white/10 dark:text-white">
                                {activeItem.icon &&
                                    React.createElement(activeItem.icon, { size: 17 })}
                                {t(activeItem.label)}
                            </div>

                            <MultiLevelMenu
                                items={activeItem.children}
                                mobile={false}
                            />
                        </div>
                    </div>,
                    document.body
                )
            }
            <div className='flex flex-col justify-between items-center space-y-0.5 pb-4'>
                {user ? (
                    <>
                        <CartButton rounded='lg' />
                        <DropdownButton
                            className='w-full text-left bg-transparent'
                            iconOnly={true}
                            showArrow={false}
                            label={
                                <Avatar
                                    imageUrl={user.image_url}
                                    size={24}
                                    rounded="full"
                                />
                            }
                            items={[
                                { label: 'Edit Profile', value: 'edit-profile', icon: <IconUserEdit size={18} /> },
                                { label: <> Logout</>, value: 'Logout', icon: <IconLogout size={18} /> },
                            ]}
                            onSelect={(item) => {
                                if (item.value === 'Logout') {
                                    logout();
                                } else if (item.value === 'edit-profile' && user?.id) {
                                    navigate(`/users/${user.id}/edit`);
                                }
                            }}
                        />
                    </>
                ) : (
                    <Button
                        type="button"
                        variant="secondary"
                        icon={<IconUserEdit size={18} />}
                        iconOnly
                        label="Sign Up"
                        className='bg-transparent'
                        onClick={() => navigate('/sign-up')}
                        rounded='full'
                    />
                )}
            </div>
        </div>
    );
};

export default DesktopSidebarToggleButton;
