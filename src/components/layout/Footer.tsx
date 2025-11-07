import React from 'react';
import { useNavigate } from 'react-router';
import { IconLogout, IconUserEdit, IconShoppingBag } from '@tabler/icons-react';
import { useAuth } from '../../contexts/authContext';
import { useCart } from '../../contexts/cartContext';
import Avatar from '../common/Avatar';
import DropdownButton from '../common/DropdownButton';
import Button from '../common/Button';


const Footer: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { items, totalAmount } = useCart();

    // Calculate total quantity of all items in cart
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    const handleCartClick = () => {
        if (items.length === 0) {
            // Optional: show a toast or alert
            // e.g. toast.info("Your cart is empty!");
            return;
        }
        navigate("/payments", { state: { fromCart: true } });
    };
    return (
        <footer className="flex justify-between items-center space-x-2 border-t border-zinc-950/5 p-4 dark:border-white/5">
            {user ? (
                <div className="flex items-center justify-between w-full gap-3">
                    {/* LEFT: Dropdown user menu */}
                    <div className="flex-1 min-w-0">
                        <DropdownButton
                            className='w-full text-left bg-transparent'
                            label={
                                <>
                                    <Avatar
                                        imageUrl={user.image_url}
                                        size={32}
                                        rounded="full"
                                        className="mr-2"
                                    />
                                    <div className="w-20 overflow-hidden">
                                        <span className="font-medium block truncate text-sm/5 text-zinc-950 dark:text-white">
                                            {user?.username || 'Unknown'}
                                        </span>
                                        <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                                            {user?.email || 'unknown@example.com'}
                                        </span>
                                    </div>
                                </>
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
                    </div>
                    {/* Cart Button */}
                    <Button
                        variant="secondary"
                        icon={
                            <div className="relative">
                                <IconShoppingBag size={18} />
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
                </div>
            ) : (
                <Button
                    type="button"
                    label="Sign Up"
                    onClick={() => navigate('/sign-up')}
                    variant="secondary"
                    fullWidth
                    rounded='lg'
                />
            )}
        </footer>
    );
};

export default Footer;
