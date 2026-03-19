// src/components/Product/ProductManagementPage.tsx
import React, { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { ProductList } from "./components/ProductList";
import PageTitle from "../common/PageTitle";
import Button from "../common/Button";
import SideContentPanel from "../common/SideContentPanel";
import { useSideContent } from "../../hooks/useSideContent";
import ProductForm from "./components/ProductForm";

type PanelState =
    | { mode: "add" }
    | { mode: "edit"; productId: number }
    | null;

const ProductManagementPage: React.FC = () => {
    const { sideOpen, openSide, closeSide } = useSideContent();

    // ✅ NEW: store state instead of JSX
    const [panel, setPanel] = useState<PanelState>(null);


    const handleAddProduct = () => {
        setPanel({ mode: "add" });
        openSide(null); // just open panel
    };

    const handleEditProduct = (productId: number) => {
        setPanel({ mode: "edit", productId });
        openSide(null); // just open panel
    };

    const handleClose = () => {
        closeSide();
        setPanel(null);
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
                <ProductList onEdit={handleEditProduct} />
            </div>
            {/* ✅ Slide-in side panel */}
            {/* ✅ Render ProductForm HERE (stable) */}
            <SideContentPanel open={sideOpen} onClose={handleClose}>
                {panel && (
                    <ProductForm
                        key={panel.mode + (panel as any).productId} // ✅ prevent stale data
                        mode={panel.mode}
                        productId={
                            panel.mode === "edit" ? panel.productId : undefined
                        }
                        onSuccess={handleClose}
                        onCancel={handleClose}
                    />
                )}
            </SideContentPanel>

        </div>
    );
};

export default ProductManagementPage;
