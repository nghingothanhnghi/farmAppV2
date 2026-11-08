// src/co


import React, { useState } from "react";
import { IconChevronRight, IconFolder, IconFolderOpen, IconFile } from "@tabler/icons-react";

export interface TreeNodeType {
    id: string | number;
    name: string;
    type?: "folder" | "file";
    children?: TreeNodeType[];
    metadata?: React.ReactNode;
    actions?: React.ReactNode;
    disabled?: boolean;
}

interface TreeViewProps {
    data: TreeNodeType[];
    className?: string;
}

interface TreeNodeProps {
    node: TreeNodeType;
    depth: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth }) => {
    const hasChildren = Boolean(node.children?.length);
    const [isOpen, setIsOpen] = useState(true);
    const isFolder = node.type === "folder" || hasChildren;

    return (
        <li className="min-w-0">
            <div
                className={`group flex items-center gap-2 min-h-10 py-1.5 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    node.disabled ? "opacity-50" : ""
                }`}
                style={{ paddingLeft: depth * 24 + 8 }}
            >
                <button
                    type="button"
                    onClick={() => hasChildren && setIsOpen(prev => !prev)}
                    disabled={!hasChildren}
                    className="shrink-0 flex items-center justify-center w-5 h-5"
                >
                    {hasChildren ? (
                        <IconChevronRight
                            size={15}
                            className={`text-gray-500 transition-transform ${
                                isOpen ? "rotate-90" : ""
                            }`}
                        />
                    ) : null}
                </button>

                {isFolder ? (
                    isOpen
                        ? <IconFolderOpen size={18} className="shrink-0 text-amber-500" />
                        : <IconFolder size={18} className="shrink-0 text-amber-500" />
                ) : (
                    <IconFile size={18} className="shrink-0 text-gray-400" />
                )}

                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
                        {node.name}
                    </span>
                    {node.metadata}
                </div>

                {node.actions && (
                    <div className="flex items-center gap-1 shrink-0">
                        {node.actions}
                    </div>
                )}
            </div>

            {hasChildren && isOpen && (
                <ul className="relative">
                    {node.children!.map(child => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

const TreeView: React.FC<TreeViewProps> = ({ data, className = "" }) => {
    return (
        <ul className={`min-w-0 ${className}`}>
            {data.map(node => (
                <TreeNode key={node.id} node={node} depth={0} />
            ))}
        </ul>
    );
};

export default TreeView;
