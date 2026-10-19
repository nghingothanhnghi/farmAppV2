// src/components/billiard/components/PricingRulesTable.tsx
import React, { useMemo } from 'react';
import DataGrid from '../../common/dataGrid/dataGrid';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import ActionButtons from '../../common/dataGrid/actionButton';
import {
    DEFAULT_CURRENCY,
    formatMoneyString,
} from '../../../utils/billiard';
import {
    describeDays,
    describePricingParams,
    describeWindow,
    getBillingPolicyLabel,
} from '../../../utils/pricing';
import type { PricingRule } from '../../../models/interfaces/Billiard';

interface Props {
    rules: PricingRule[];
    canManage: boolean;
    saving: boolean;
    tableName: (id?: number | null) => string;
    onEdit: (rule: PricingRule) => void;
    onToggleActive: (rule: PricingRule) => void;
    onDelete: (rule: PricingRule) => void;
}

const PricingRulesTable: React.FC<Props> = ({
    rules,
    canManage,
    saving,
    tableName,
    onEdit,
    onToggleActive,
    onDelete,
}) => {

    // Highest priority first, then newest.
    const sorted = useMemo(
        () => [...rules].sort((a, b) => b.priority - a.priority || b.id - a.id),
        [rules],
    );

    const columnDefs = useMemo(() => {
        const columns: any[] = [
            {
                headerName: 'Rule',
                field: 'name',
                flex: 1,
                minWidth: 150,
            },
            {
                headerName: 'Billing',
                field: 'rule_type',
                flex: 1,
                cellStyle: { display: "flex", alignItems: "center" },
                minWidth: 160,
                valueFormatter: (p: any) => getBillingPolicyLabel(p.value),
                cellRenderer: (p: any) => {
                    const paramsText = describePricingParams(p.data?.params);

                    return (
                        <div className="py-1 whitespace-normal leading-tight">
                            <div>{getBillingPolicyLabel(p.data?.rule_type)}</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                {paramsText && <span className="block text-[0.625rem] text-gray-500 dark:text-gray-400">{paramsText}</span>}
                            </div>
                        </div>
                    );
                },
            },
            {
                headerName: 'Rate',
                field: 'hourly_rate',
                flex: 1,
                minWidth: 130,
                filter: false,
                valueFormatter: (p: any) =>
                    p.value != null && p.value !== ''
                        ? `${formatMoneyString(p.value, DEFAULT_CURRENCY)} / h`
                        : 'Table rate',
            },
            {
                headerName: 'When',
                colId: 'when',
                flex: 1,
                minWidth: 180,
                filter: false,
                sortable: false,
                cellStyle: { display: "flex", alignItems: "center" },
                valueGetter: (p: any) =>
                    `${describeDays(p.data?.days_of_week)} — ${describeWindow(p.data)}`,
                cellRenderer: (p: any) => (
                    <div className="py-1 whitespace-normal leading-tight">
                        <div>{describeDays(p.data?.days_of_week)}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                            {describeWindow(p.data)}
                        </div>
                    </div>
                ),
            },
            {
                headerName: 'Applies to',
                colId: 'table_name',
                flex: 1,
                minWidth: 140,
                valueGetter: (p: any) => tableName(p.data?.table_id),
            },
            {
                headerName: 'Priority',
                field: 'priority',
                width: 100,
                filter: false,
                cellStyle: { textAlign: 'right' },
            },
            {
                headerName: 'Status',
                field: 'is_active',
                width: 120,
                filter: false,
                cellRenderer: (p: any) => (
                    <Badge
                        label={p.value ? 'Active' : 'Inactive'}
                        variant={p.value ? 'success' : 'gray'}
                    />
                ),
            },
        ];

        if (canManage) {
            columns.push({
                headerName: 'Actions',
                colId: 'actions',
                minWidth: 245,
                flex: 1,
                sortable: false,
                filter: false,
                cellRenderer: (p: any) => {
                    const rule: PricingRule = p.data;

                    return (
                        <div className="flex items-center gap-2 h-full">
                            <ActionButtons
                                row={rule}
                                onEdit={() => onEdit(rule)}
                                onDelete={() => onDelete(rule)}
                                disabled={saving}
                                disableView
                                disablePrint
                                disableShare
                                editLabel="Edit"
                                deleteLabel="Delete"
                            />

                            <Button
                                label={rule.is_active ? 'Deactivate' : 'Activate'}
                                size="xs"
                                variant="secondary"
                                rounded="lg"
                                disabled={saving}
                                onClick={() => onToggleActive(rule)}
                            />
                        </div>
                    );
                },
            });
        }

        return columns;
    }, [
        canManage,
        saving,
        tableName,
        onEdit,
        onToggleActive,
        onDelete,
    ]);

    return (
        <div className="space-y-4 flex flex-col h-full min-h-0">
            <DataGrid
                rowData={sorted}
                columnDefs={columnDefs}
                pagination
                paginationPageSize={10}
                height="auto"
            />
            <div className="shrink-0 pt-2 text-xs text-gray-500 dark:text-gray-400">
                When several rules match, the highest priority wins, then a table-specific rule over an all-tables rule, then the newest.
            </div>
        </div>
    );
};

export default PricingRulesTable;