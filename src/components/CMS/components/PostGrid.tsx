// src/components/CMS/components/PostGrid.tsx
import { useMemo } from 'react';
import type { CmsPost } from "../../../models/interfaces/Post";
import DataGrid from '../../common/dataGrid/dataGrid';
import Avatar from "../../common/Avatar";
import ActionButtons from '../../common/dataGrid/actionButton';
import Button from '../../common/Button';
import { IconPencil, IconTrash, IconSend, IconArchive } from '@tabler/icons-react';
import Badge from '../../common/Badge';
import PostStatusBadge from './PostStatusBadge';

interface Props {

    posts: CmsPost[];

    loading: boolean;

    onEdit: (post: CmsPost) => void;

    onDelete: (post: CmsPost) => void;

    onPublish: (post: CmsPost) => void;

    onArchive: (post: CmsPost) => void;

}

export default function PostGrid({
    posts,
    loading,
    onEdit,
    onDelete,
    onPublish,
    onArchive
}: Props) {

    if (loading) {

        return <div>Loading...</div>;

    }

    const columnDefs = useMemo(() => [
        {
            headerName: "",
            field: "featured_image",
            width: 70,
            filter: false,
            sortable: false,
            resizable: false,
            cellRenderer: ({ data }: any) => (
                <Avatar
                    imageUrl={data.featured_image?.url}
                    alt={data.title}
                    size={36}
                    rounded="md"
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
            width: 120,
            filter: false,
            sortable: false,
            cellRenderer: ({ data }: any) => <PostStatusBadge status={data.status} />
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
            valueGetter: (p: any) => p.data.published_at || "-",
        },
        {
            headerName: "Author",
            width: 140,
            filter: false,
            sortable: false,
            valueGetter: (p: any) => p.data.author?.username || "-",
        },
        {
            headerName: "Actions",
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
                        icon={<IconPencil size={16} stroke={1.5} />}
                        iconOnly
                        variant="secondary"
                        onClick={() => onEdit(data)}
                        label="Edit"
                        size="xs"
                        rounded="full"
                        className="bg-transparent"
                    />
                    <Button
                        icon={<IconSend size={16} stroke={1.5} />}
                        iconOnly
                        variant="secondary"
                        onClick={() => onPublish(data)}
                        disabled={data.status === "published"}
                        label="Publish"
                        size="xs"
                        rounded="full"
                        className="bg-transparent"
                    />
                    <Button
                        icon={<IconArchive size={16} stroke={1.5} />}
                        iconOnly
                        variant="secondary"
                        onClick={() => onArchive(data)}
                        disabled={data.status === "archived"}
                        label="Archive"
                        size="xs"
                        rounded="full"
                        className="bg-transparent"
                    />

                    <ActionButtons

                        row={data}

                        onEdit={onEdit}

                        onDelete={onDelete}

                    />

                    <Button
                        icon={<IconTrash size={16} stroke={1.5} />}
                        iconOnly
                        variant="secondary"
                        onClick={() => onDelete(data)}
                        label="Delete"
                        size="xs"
                        rounded="full"
                        className="bg-transparent"
                    />
                </div>
            )
        }
    ], [onEdit, onDelete, onPublish, onArchive]);

    return (

        <DataGrid

            rowData={posts}

            columnDefs={columnDefs}

            pagination

            paginationPageSize={10}

            height="650px"

        />

    );

}