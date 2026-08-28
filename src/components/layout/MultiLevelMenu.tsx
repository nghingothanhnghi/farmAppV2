import React, { useState } from 'react';
import { IconChevronRight, IconChevronLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import Button from '../common/Button';
import ListLink from '../common/ListLink';
import type { MenuItem } from '../../config/menu';

interface MultiLevelMenuProps {
    items: MenuItem[];
    mobile?: boolean;
    onNavigate?: () => void;
}

export default function MultiLevelMenu({
    items,
    mobile = false,
    onNavigate,
}: MultiLevelMenuProps) {
    const navigate = useNavigate();

    const [path, setPath] = useState<MenuItem[]>([]);

    const currentItems =
        path.length === 0
            ? items
            : path[path.length - 1].children ?? [];

    const currentParent =
        path.length > 0
            ? path[path.length - 1]
            : null;

    const openLevel = (item: MenuItem) => {
        if (!item.children?.length) {
            if (item.to) {
                navigate(item.to);
                onNavigate?.();
            }

            return;
        }

        setPath([...path, item]);
    };

    const goBack = () => {
        setPath(path.slice(0, -1));
    };

    return (
        <div className="relative flex-1 min-h-0 overflow-hidden">

            {/* Current menu */}
            <div className="h-full overflow-y-auto">

                {/* Mobile back button */}
                {mobile && currentParent && (
                    <Button
                        type="button"
                        label={currentParent.label}
                        onClick={goBack}
                        variant="secondary"
                        icon={<IconChevronLeft size={16} />}
                        iconPosition='left'
                        size='sm'
                        rounded='sm'
                    />
                )}

                {currentItems.map((item) => {
                    const hasChildren = !!item.children?.length;
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.id}
                            className="relative"
                            onMouseEnter={() => {
                                if (!mobile && hasChildren) {
                                    setPath([...path, item]);
                                }
                            }}
                        >
                            <div className="flex items-center">

                                {item.to ? (
                                    <ListLink
                                        to={item.to}
                                        icon={
                                            Icon ? <Icon size={16} /> : undefined
                                        }
                                        label={item.label}

                                        onClick={onNavigate}
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => openLevel(item)}
                                        className="
                      flex flex-1 items-center gap-2
                      rounded-lg px-3 py-2
                      text-sm
                      text-gray-700 dark:text-gray-200
                      hover:bg-gray-100
                      dark:hover:bg-gray-800
                    "
                                    >
                                        {Icon && <Icon size={16} />}

                                        <span>{item.label}</span>
                                    </button>
                                )}

                                {hasChildren && (
                                    <button
                                        type="button"
                                        onClick={() => openLevel(item)}
                                        className="
                      p-2
                      text-gray-400
                      hover:text-gray-700
                      dark:hover:text-gray-200
                    "
                                    >
                                        <IconChevronRight size={16} />
                                    </button>
                                )}

                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop child panel */}
            {!mobile && path.length > 0 && (
                <div
                    className="
            absolute
            top-0 left-full
            h-full w-64
            bg-white dark:bg-zinc-900
            border border-gray-200
            dark:border-white/10
            shadow-xl
            rounded-r-xl
            p-2
          "
                >
                    <MultiLevelMenu
                        items={currentItems}
                        mobile={false}
                        onNavigate={onNavigate}
                    />
                </div>
            )}

        </div>
    );
}