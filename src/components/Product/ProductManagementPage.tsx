// src/components/Product/ProductManagementPage.tsx
import React from "react";
import { IconPlus } from "@tabler/icons-react";
import { ProductList } from "./components/ProductList";
import PageTitle from "../common/PageTitle";
import Button from "../common/Button";

const ProductManagementPage: React.FC = () => {
    return (
        <div className="">
            <PageTitle
                title="Product Management"
                actions={(
                    <Button
                        type="button"
                        label="Add Product"
                        onClick={() => alert("Open Create Product modal or page")}
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
        </div>
    );
};

export default ProductManagementPage;
