// src/components/ProductList.tsx
import React, { useState } from "react";
import { useProductContext } from "../../../contexts/productContext";
import { ProductCard } from "./ProductCard";
import Spinner from "../../common/Spinner";
import EmptyState from "../../common/EmptyState";
import noDataAnimation from '../../../assets/lottie/empty_data.json'
import { useAlert } from '../../../contexts/alertContext';
import Modal from '../../common/Modal';
import Button from "../../common/Button";
import { IconAlertCircle } from '@tabler/icons-react';
import { useItemFilter } from "../../../hooks/useItemFilter";
import { ProductFilter } from "./ProductFilter";

export const ProductList: React.FC = () => {
    const { products, loading, error, actions } = useProductContext();
    const { filters, setFilters, filteredProducts } = useItemFilter(products);
    const { setAlert } = useAlert();
    // ✅ modal + selected state
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);

    // ✅ Open modal when user clicks delete
    const handleDeleteClick = (product: any) => {
        setSelectedProduct(product);
        setConfirmModalOpen(true);
    };

    // ✅ Confirm and delete
    const handleConfirmRemove = async () => {
        if (!selectedProduct) return;
        setDeleting(true);

        try {
            await actions.deleteProduct(selectedProduct.id);
            await actions.fetchProducts();
            setAlert({
                type: "success",
                message: `Product "${selectedProduct.name}" deleted successfully.`,
            });
        } catch (err) {
            setAlert({
                type: "error",
                message: "Failed to delete product.",
            });
        } finally {
            setDeleting(false);
            setConfirmModalOpen(false);
            setSelectedProduct(null);
        }
    };

    if (loading) return <Spinner size={32} />;
    if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

    return (
        <div className="space-y-6">
            {/* ✅ Filter Section */}
            <ProductFilter filters={filters} setFilters={setFilters} />
            {filteredProducts.length === 0 ? (
                <EmptyState
                    animationData={noDataAnimation}
                    message="No products available"
                />
            ) : (
                <div
                    className="
            grid 
            gap-6
            [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]
          "
                >
                    {filteredProducts.map((p) => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            onDelete={() => handleDeleteClick(p)} // ✅ open modal instead of deleting immediately
                            onSelect={(id) => {
                                console.log("Selected product:", id);
                                // e.g. navigate(`/products/${id}`)
                            }}
                        />
                    ))}
                </div>
            )}

            <Modal
                showCloseButton={false}
                size='xsmall'
                isOpen={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setSelectedProduct(null);
                }}
                content={
                    <div className="text-sm px-10 pt-6 pb-10 text-center">
                        <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
                        {selectedProduct && (
                            <>
                                Are you sure you want to delete product{" "}
                                <strong>{selectedProduct.name}</strong>?
                            </>
                        )}
                    </div>
                }
                actions={
                    <div className="flex gap-4">
                        <Button
                            label={deleting ? "Deleting..." : "Yes, Remove"}
                            variant="danger"
                            onClick={handleConfirmRemove}
                            className='min-w-[150px]'
                            rounded='lg'
                            disabled={deleting}
                        />
                        <Button
                            label="Cancel"
                            variant="secondary"
                            onClick={() => setConfirmModalOpen(false)}
                            className='min-w-[150px]'
                            rounded='lg'
                        />
                    </div>
                }
            />
        </div>
    );
};
