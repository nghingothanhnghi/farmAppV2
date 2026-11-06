// src/components/layout/DesktopSidebarToggleButton.tsx
import React, { useState } from 'react';
import { IconLayoutSidebarLeftExpand, IconDeviceGamepad3, IconChevronRight, IconDeviceMobileCheck, IconCamera, IconCircleNumber1, IconBrain, IconPlant, IconUserShield, IconSportBillard, IconCheese, IconArticle, IconCalendarCheck, IconAnalyze, IconCashRegister, IconLogout, IconUserEdit } from '@tabler/icons-react';
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
    const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
    const [hovered, setHovered] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleMouseLeave = () => {
        setActiveItem(null);
    };

    return (
        <div className={`hidden lg:flex lg:flex-col fixed top-0 left-4 z-40 bg-transparent h-full min-h-0 ${className}`}
            onMouseLeave={handleMouseLeave}>
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
            {/* <div className="flex flex-1 flex-col overflow-y-auto space-y-0.5 pt-8 ">
                <ListLink to="/scheduler-health" icon={<IconCalendarCheck size={16} />} label="Health Schedule" iconOnlyMode={true} />
                <ListLink to="/devices-controller" icon={<IconDeviceMobileCheck size={16} />} label="Devices Controller" iconOnlyMode={true} />
                <ListLink to="/ar-detection" icon={<IconCamera size={16} />} label="AR Detection" iconOnlyMode={true} />
                <ListLink to="/model-training" icon={<IconBrain size={16} />} label="Model Training" iconOnlyMode={true} />
                <ListLink to="/hydroponic-system" icon={<IconPlant size={16} />} label="Hydroponics" iconOnlyMode={true} />
                <ListLink to="/jackpot" icon={<IconCircleNumber1 size={16} />} label="Jackpot" iconOnlyMode={true} />
                <ListLink to="/dashboard/products" icon={<IconCheese size={16} />} label="Products" iconOnlyMode={true} />
                <ListLink to="/dashboard/cms" icon={<IconArticle size={16} />} label="CMS Content" iconOnlyMode={true} />
                <ListLink to="/billiard" icon={<IconSportBillard size={16} />} label="Billiard" iconOnlyMode={true} />
                <ListLink to="/users" icon={<IconUserShield size={16} />} label="User Management" iconOnlyMode={true} />
                <ListLink to="/migrate" icon={<IconAnalyze size={16} />} label="Data Migration" iconOnlyMode={true} />
                <ListLink to="/payments" icon={<IconCashRegister size={16} />} label="Payments" iconOnlyMode={true} />
            </div> */}
            <div className="flex flex-1 flex-col overflow-y-auto space-y-0.5 pt-8">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const hasChildren = !!item.children?.length;
                    const isActive = activeItem?.id === item.id;

                    return (
                        <div
                            key={item.id}
                            className="relative"
                            onMouseEnter={() => {
                                setActiveItem(hasChildren ? item : null);
                            }}
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
                                        icon={
                                            Icon ? <Icon size={16} /> : undefined
                                        }
                                        label={item.label}
                                        iconOnlyMode={true}
                                    />
                                ) : (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        icon={
                                            Icon ? <Icon size={16} /> : undefined
                                        }
                                        iconOnly
                                        label={item.label}
                                        rounded="lg"
                                        size="sm"
                                        className="bg-transparent"
                                    />
                                )}
                            </div>

                            {/* Floating child menu */}
                            {hasChildren && isActive && (
                                <div
                                    className="
                                        absolute left-full top-0 z-50 ml-2
                                        w-64 max-h-[calc(100vh-2rem)]
                                        overflow-y-auto
                                        rounded-xl border border-gray-200
                                        bg-white p-3 shadow-xl
                                        dark:border-white/10
                                        dark:bg-zinc-900
                                    "
                                    onMouseEnter={() => setActiveItem(item)}
                                >
                                    <div className="mb-2 flex items-center justify-between border-b border-gray-100 px-2 pb-3 dark:border-white/10">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white">
                                            {Icon && <Icon size={17} />}
                                            {item.label}
                                        </div>

                                        <IconChevronRight
                                            size={15}
                                            className="text-gray-400"
                                        />
                                    </div>

                                    <MultiLevelMenu
                                        items={item.children ?? []}
                                        mobile={false}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className='flex flex-col justify-between items-center space-y-0.5 pb-4'>
                {user ? (
                    <>
                        <CartButton rounded="lg" />

                        <DropdownButton
                            className="w-full text-left bg-transparent"
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
                                {
                                    label: 'Edit Profile',
                                    value: 'edit-profile',
                                    icon: <IconUserEdit size={18} />,
                                },
                                {
                                    label: 'Logout',
                                    value: 'Logout',
                                    icon: <IconLogout size={18} />,
                                },
                            ]}
                            onSelect={(item) => {
                                if (item.value === 'Logout') {
                                    logout();
                                } else if (
                                    item.value === 'edit-profile' &&
                                    user?.id
                                ) {
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
                        className="bg-transparent"
                        onClick={() => navigate('/sign-up')}
                        rounded="full"
                    />
                )}
            </div>
        </div>
    );
};

export default DesktopSidebarToggleButton;
