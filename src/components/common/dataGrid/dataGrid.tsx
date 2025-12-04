import React, { useMemo, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AG_GRID_LOCALE_VN } from './locale/vi-VN';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../hooks/useTheme';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

import type { DataGridProps } from '../../../models/interfaces/DataGrid';

const DataGrid: React.FC<DataGridProps> = ({
  rowData = [],
  columnDefs = [],
  defaultColDefOptions = {},
  pagination = true,
  paginationPageSize = 10,
  onRowClicked,
  height = '500px',
  theme = 'ag-theme-alpine',
  lottieSrc, // Lottie animation URL
  image, // Fallback image URL
}) => {

  const gridApiRef = useRef<any>(null); // Store Grid API reference
  const { t, i18n } = useTranslation();

  // ✅ Use global theme instead of localStorage
  const { theme: userTheme } = useTheme();

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const isDarkMode =
    userTheme === 'dark' ||
    (userTheme === 'system' && prefersDark);

  // 🔥 Auto-switch between AG Grid themes
  const appliedTheme = isDarkMode ? 'ag-theme-alpine-dark' : theme;

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    ...defaultColDefOptions,
  }), [defaultColDefOptions]);

  // Select locale based on language
  const localeText = useMemo(() => {
    return i18n.language === 'vi' ? AG_GRID_LOCALE_VN : {};
  }, [i18n.language]);

  // 🔹 Force AG Grid to update when language changes
  useEffect(() => {
    if (gridApiRef.current) {
      gridApiRef.current.refreshHeader(); // ✅ Refresh column headers
      gridApiRef.current.refreshCells({ force: true }); // ✅ Refresh table content
      gridApiRef.current.redrawRows();
    }
  }, [localeText, appliedTheme]);


  const noRowsOverlay = `
<div className="text-center py-10">
  ${lottieSrc
      ? `<iframe src="${lottieSrc}" class="mx-auto mb-4 w-24 h-24" title="Lottie Animation" frameborder="0" allowfullscreen></iframe>`
      : image
        ? `<img src="${image}" alt="Empty State" class="mx-auto mb-4 w-40 h-40 object-contain" />`
        : ""
    }
  <p className="text-gray-600 mb-8">${t("dataGrid.bodyName.no_matching_results")}</p>
</div>
`;



  return (
    <div className={`${appliedTheme} w-full`} style={{ height }}>
      <AgGridReact
        key={appliedTheme}           // 🔥 FORCE remount grid when theme changes
        onGridReady={(params) => {
          gridApiRef.current = params.api; // Store the Grid API reference
          params.api.refreshHeader(); // Ensure headers update immediately
        }}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={pagination}
        paginationPageSize={paginationPageSize}
        onRowClicked={onRowClicked}
        overlayNoRowsTemplate={noRowsOverlay}
        localeText={localeText}
      />
    </div>
  );
};

export default DataGrid;
