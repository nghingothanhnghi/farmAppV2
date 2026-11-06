// src/components/common/Pagination.tsx

import React from 'react';
import Button from './Button';

interface PaginationProps {
    page: number;
    total: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    loading?: boolean;
    showInfo?: boolean;
    showPageNumbers?: boolean;
    siblingCount?: number;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    page,
    total,
    pageSize,
    onPageChange,
    loading = false,
    showInfo = true,
    showPageNumbers = false,
    siblingCount = 1,
    className = '',
}) => {
    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));

    if (totalPages <= 1 && !showInfo) return null;

    const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, total);

    const getPageNumbers = () => {
        const start = Math.max(1, currentPage - siblingCount);
        const end = Math.min(totalPages, currentPage + siblingCount);

        return Array.from(
            { length: end - start + 1 },
            (_, index) => start + index
        );
    };

    return (
        <div className={`flex flex-wrap items-center justify-between gap-4 py-4 text-sm ${className}`}>
            {showInfo && (
                <span className="text-gray-600 dark:text-gray-300">
                    Showing {startItem}–{endItem} of {total}
                </span>
            )}

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    label="Previous"
                    variant="secondary"
                    size="sm"
                    rounded="lg"
                    disabled={loading || currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                />

                {showPageNumbers && getPageNumbers().map((pageNumber) => (
                    <Button
                        key={pageNumber}
                        type="button"
                        label={String(pageNumber)}
                        variant={pageNumber === currentPage ? 'primary' : 'secondary'}
                        size="sm"
                        rounded="lg"
                        disabled={loading}
                        onClick={() => onPageChange(pageNumber)}
                    />
                ))}

                <Button
                    type="button"
                    label="Next"
                    variant="secondary"
                    size="sm"
                    rounded="lg"
                    disabled={loading || currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                />
            </div>
        </div>
    );
};

export default Pagination;
