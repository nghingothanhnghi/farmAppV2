
// src/models/interfaces/DataGrid.ts
// This file defines the TypeScript interface for the DataGrid component used in the application.
export interface DataGridProps {
    rowData: any[];
    columnDefs: any[];
    defaultColDefOptions?: object;
    pagination?: boolean;
    paginationPageSize?: number;
    onRowClicked?: (event: any) => void;
    height?: string | "auto";
    theme?: string;
    lottieSrc?: string; // ✅ New: Lottie animation URL (optional)
    image?: string; // ✅ New: Image URL (optional)
}

export interface ActionButtonsProps {
    row: any;
    onView?: (row: any) => void;
    onPrint?: (row: any) => void;
    onShare?: (row: any) => void;
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    /** Disable all action buttons */
    disabled?: boolean;
    /** Disable individual action buttons */
    disableView?: boolean;
    disablePrint?: boolean;
    disableShare?: boolean;
    disableEdit?: boolean;
    disableDelete?: boolean;
    // Individual labels
    viewLabel?: string;
    printLabel?: string;
    shareLabel?: string;
    editLabel?: string;
    deleteLabel?: string;
}