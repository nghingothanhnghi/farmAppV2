// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { IconDeviceGamepad3, IconSettings, IconUserCog, IconLayoutSidebarLeftCollapse, IconShoppingCart } from '@tabler/icons-react';
import DropdownButton from '../common/DropdownButton';
import Button from '../common/Button';
import Modal from '../common/Modal';
import AlertDropdown from '../global/AlertDropdown';
import { GeneralTab, AccountTab } from '../Settings';
import { useHydroSystem } from '../../hooks/useHydroSystem';
import { useCart } from '../../contexts/cartContext';
import { useNavigate } from 'react-router';

type HeaderProps = {
  appName?: string;
  brandUrl?: string;
  userName?: string;
  userAvatar?: string; // image URL
  open?: boolean;
  onClose?: () => void;
};

const Header: React.FC<HeaderProps> = ({ brandUrl, appName, onClose }) => {
  const {
    alerts,
    controlActions,
    actions
  } = useHydroSystem();
  const { items } = useCart();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ Modal state
  const [activeTab, setActiveTab] = useState('general'); // ✅ Add this

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCartClick = () => {
    navigate('/payments');
  };
  return (
    <React.Fragment>
      <header className="w-full border-b border-zinc-950/5 p-4 dark:border-white/5 flex items-center justify-between space-x-2">
        {/* Left: Branding */}
        <div className="flex items-center space-x-2">
          <DropdownButton
            className='w-full text-left bg-transparent'
            label={
              <>
                {brandUrl ? (
                  <img src={brandUrl} alt="Logo" className="h-6 w-6" />
                ) : (
                  <IconDeviceGamepad3 size={24} className="text-orange-600 icon-pulse" />
                )}
                <span className="text-sm font-bold text-gray-800 hidden">{appName}</span>
              </>
            }
            items={[
              { label: <> Drops App</>, value: 'https://dropsapp.netlify.app/login', icon: <IconDeviceGamepad3 size={18} /> },
            ]}
            onSelect={(item) => console.log('Selected:', item.value)}
          />
        </div>
        {/* Right: Settings */}
        <div className="flex items-center space-x-2">
          <div className='flex items-center space-x-0.5'>
            {/* Cart Button */}
            <Button
              variant="secondary"
              icon={
                <div className="relative">
                  <IconShoppingCart size={18} />
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </div>
              }
              iconOnly
              label="Cart"
              className='bg-transparent'
              onClick={handleCartClick}
              rounded='full'
            />
            <AlertDropdown
              alerts={alerts}
              controlActions={controlActions}
              onResolveAlert={actions.resolveAlert}
            />
            <Button
              variant="secondary"
              icon={<IconSettings size={18} />}
              iconOnly
              label="Close"
              className='bg-transparent'
              onClick={handleOpenModal}
              rounded='full'
            />
          </div>
          {/* Close button for mobile and desktop screens */}
          <Button
            variant="secondary"
            icon={<IconLayoutSidebarLeftCollapse size={18} />}
            iconOnly
            label="Close"
            className='bg-transparent'
            onClick={onClose}
            rounded='full'
          />
        </div>
      </header>
      {/* ✅ Modal rendered here */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={<h2 className="text-lg font-semibold">Settings</h2>}
        variant="sidebar"
        sidebarTabs={[
          { id: 'general', label: 'General', icon: <IconSettings size={18} /> },
          { id: 'account', label: 'Account', icon: <IconUserCog size={18} /> },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        content={
          activeTab === 'general' ? (
            <GeneralTab />
          ) : (
            <AccountTab />
          )
        }
        position="center"
      />
    </React.Fragment>
  );
};

export default Header;
