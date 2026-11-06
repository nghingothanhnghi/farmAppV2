// src/components/CMS/components/PostGrid.tsx
import { useMemo } from 'react';
import type { CmsPost } from "../../../models/interfaces/Post";
import DataGrid from '../../common/dataGrid/dataGrid';
import ProductImage from "../../common/ProductImage";
import ActionButtons from '../../common/dataGrid/actionButton';
import Button from '../../common/Button';
import { IconSend, IconArchive, IconClock } from '@tabler/icons-react';
import Badge from '../../common/Badge';
import PostStatusDisplay from './PostStatusDisplay';
import { formatDateTime } from '../../../utils/formatters';

interface Props {
    posts: CmsPost[];
    loading: boolean;
    onEdit: (post: CmsPost) => void;
    onDelete: (post: CmsPost) => void;
    onPublish: (post: CmsPost) => void;
    onArchive: (post: CmsPost) => void;
    onSchedule: (post: CmsPost) => void;
    /** Row-level permission (own post or editor). Defaults to allowed; backend still enforces 403. */
    canManage?: (post: CmsPost) => boolean;
}

export default function PostGrid({
    posts,
    loading,
    onEdit,
    onDelete,
    onPublish,
    onArchive,
    onSchedule,
    canManage = () => true,
}: Props) {

    const columnDefs = useMemo(() => [
        {
            headerName: "",
            field: "featured_image",
            width: 70,
            filter: false,
            sortable: false,
            resizable: false,
            cellStyle: { display: "flex", justifyContent: "center", alignItems: "center", padding: 0 },
            cellRenderer: ({ data }: any) => (
                <ProductImage
                    imageUrl={data.featured_image?.url}
                    alt={data.title}
                    size={24}
                    rounded="lg"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
            )
        },
        { headerName: "Title", field: "title", flex: 2 },
        { headerName: "Slug", field: "slug", flex: 1.5, filter: false },
        {
            headerName: "Category",
            flex: 1,
            filter: false,
            sortable: false,
            valueGetter: (p: any) => p.data.category?.name || "-",
        },
        {
            headerName: "Status",
            width: 170,
            filter: false,
            sortable: false,
            cellStyle: { display: "flex", alignItems: "center" },
            cellRenderer: ({ data }: any) => (
                <PostStatusDisplay
                    status={data.status}
                    scheduledAt={data.scheduled_at}
                />
            )
        },
        {
            headerName: "Featured",
            width: 110,
            filter: false,
            sortable: false,
            cellRenderer: ({ data }: any) =>
                data.is_featured
                    ? <Badge label="Featured" variant="success" />
                    : null
        },
        { headerName: "Views", field: "view_count", width: 90, filter: false },
        {
            headerName: "Published",
            width: 150,
            filter: false,
            sortable: false,
            valueGetter: (p: any) => formatDateTime(p.data.published_at) || "-",
        },
        {
            headerName: "Author",
            width: 140,
            filter: false,
            sortable: false,
            valueGetter: (p: any) => p.data.author?.username || "-",
        },
        {
            headerName: "",
            field: "actions",
            width: 200,
            filter: false,
            sortable: false,
            resizable: false,
            pinned: "right",
            cellStyle: { textAlign: "center" },
            cellRenderer: ({ data }: any) => (
                <div className="flex gap-2 items-center justify-center h-full">
                    <Button
                        icon={<IconSend size={16} stroke={1.5} />}
                        iconOnly
                        variant="secondary"
                        onClick={() => onPublish(data)}
                        disabled={data.status === "published" || !canManage(data)}
                        label="Publish"
                        size="xs"
                        rounded="full"
                        className="bg-transparent"
                    />
                    <Button
                        icon={<IconClock size={16} stroke={1.5} />}
                        iconOnly
                        variant="secondary"
                        onClick={() => onSchedule(data)}
                        disabled={data.status === "published" || data.status === "archived" || !canManage(data)}
                        label="Schedule"
                        size="xs"
                        rounded="full"
                        className="bg-transparent"
                    />
                    <Button
                        icon={<IconArchive size={16} stroke={1.5} />}
                        iconOnly
                        variant="secondary"
                        onClick={() => onArchive(data)}
                        disabled={data.status === "archived" || !canManage(data)}
                        label="Archive"
                        size="xs"
                        rounded="full"
                        className="bg-transparent"
                    />

                    <ActionButtons
                        row={data}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        disabled={!canManage(data)}
                    />

                </div>
            )
        }
    ], [onEdit, onDelete, onPublish, onArchive, onSchedule, canManage]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (

        <DataGrid
            rowData={posts}
            columnDefs={columnDefs}
            pagination={false} // paging is server-side, see CmsPostManagementPage
            height="auto"
        />

    );

}