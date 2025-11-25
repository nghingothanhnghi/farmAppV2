// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { IconDeviceGamepad3, IconSettings, IconUserCog, IconLayoutSidebarLeftCollapse } from '@tabler/icons-react';
import DropdownButton from '../common/DropdownButton';
import Button from '../common/Button';
import Modal from '../common/Modal';
import AlertDropdown from '../global/AlertDropdown';
import { GeneralTab, AccountTab } from '../Settings';
import { useHydroSystem } from '../../hooks/useHydroSystem';

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
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ Modal state
  const [activeTab, setActiveTab] = useState('general'); // ✅ Add this

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

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
                  <IconDeviceGamepad3 size={18} className="text-orange-600 icon-pulse" />
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
