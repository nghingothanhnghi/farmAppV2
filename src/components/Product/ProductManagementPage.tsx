// src/components/Product/ProductManagementPage.tsx
import React from "react";
import { IconPlus } from "@tabler/icons-react";
import { ProductList } from "./components/ProductList";
import PageTitle from "../common/PageTitle";
import Button from "../common/Button";
import SideContentPanel from "../common/SideContentPanel";
import { useSideContent } from "../../hooks/useSideContent";
import ProductForm from "./components/ProductForm";

const ProductManagementPage: React.FC = () => {
    const { sideOpen, content, openSide, closeSide } = useSideContent();

    const handleAddProduct = () => {
        openSide(
            <ProductForm
                mode="add"
                onSuccess={closeSide}
                onCancel={closeSide}
            />
        );
    };
    return (
        <div className="">
            <PageTitle
                title="Product Management"
                actions={(
                    <Button
                        type="button"
                        label="Add Product"
                        onClick={handleAddProduct}
                        variant="secondary"
                        icon={<IconPlus size={16} className="text-gray-500" />}
                        iconPosition='left'
                        rounded='lg'
                    />
                )}
            />
            <div className="mx-auto">
                {/* ✅ Product list below */}
                <ProductList />
            </div>
            {/* ✅ Slide-in side panel */}
            <SideContentPanel open={sideOpen} onClose={closeSide}>
                {content}
            </SideContentPanel>
        </div>
    );
};

export default ProductManagementPage;
