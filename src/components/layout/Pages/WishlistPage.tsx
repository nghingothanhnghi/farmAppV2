// src/components/layout/Pages/WishlistPage.tsx
import React from 'react';
import PageTitle from '../../common/PageTitle';
import WishlistItemList from '../../common/wishList/WishlistItemList';


const WishlistPage: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <PageTitle title="Sản phẩm yêu thích" />
            <WishlistItemList />
        </div>
    );
};

export default WishlistPage;