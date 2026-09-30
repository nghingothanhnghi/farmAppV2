import React from 'react';
import type { ActionButtonsProps } from '../../../models/interfaces/DataGrid';
import { IconPencil, IconPrinter, IconShare, IconTrash, IconEye } from '@tabler/icons-react';
import Button from '../Button';

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
    row, 
    onView, 
    onPrint, 
    onShare, 
    onEdit, 
    onDelete, 
    disabled = false,
    disableView = false, 
    disablePrint = false, 
    disableShare = false, 
    disableEdit = false, 
    disableDelete = false,
    viewLabel = 'View',
    printLabel = 'Print',
    shareLabel = 'Share',
    editLabel = 'Edit',
    deleteLabel = 'Delete',
}) => {
    return (
        <div className="flex gap-2 items-center justify-center h-full">
            {onView && (
                <Button
                    icon={
                        <IconEye size={16} stroke={1.5}/>
                    }
                    iconOnly
                    variant="secondary"
                    onClick={() => onView(row)}
                    label={viewLabel}
                    size='xs'
                    rounded="full"
                    className='bg-transparent'
                    disabled={disabled || disableView}
                />
            )}
            {onPrint && (
                <Button
                    icon={
                        <IconPrinter size={16} stroke={1.5}/>
                    }
                    iconOnly
                    variant="secondary"
                    onClick={() => onPrint(row)}
                    label={printLabel}
                    size='xs'
                    rounded="full"
                    className='bg-transparent'
                    disabled={disabled || disablePrint}
                />
            )}
            {onShare && (
                <Button
                    icon={
                        <IconShare size={16} stroke={1.5}/>
                    }
                    iconOnly
                    variant="secondary"
                    onClick={() => onShare(row)}
                    label={shareLabel}
                    size='xs'
                    rounded="full"
                    className='bg-transparent'
                    disabled={disabled || disableShare}
                />
            )}
            {/* Edit Button */}
            {onEdit && (
                <Button
                    icon={
                        <IconPencil size={16} stroke={1.5}/>
                    }
                    iconOnly
                    variant="secondary"
                    onClick={() => onEdit(row)}
                    label={editLabel}
                    size='xs'
                    rounded="full"
                    className='bg-transparent'
                    disabled={disabled || disableEdit}
                />
            )}
            {/* Delete Button */}
            {onDelete && (
                <Button
                    icon={
                        <IconTrash size={16} stroke={1.5}/>
                    }
                    iconOnly
                    variant="secondary"
                    onClick={() => onDelete(row)}
                    label={deleteLabel}
                    size='xs'
                    rounded="full"
                    className='bg-transparent'
                    disabled={disabled || disableDelete}
                />
            )}
        </div>
    );
};

export default ActionButtons;
