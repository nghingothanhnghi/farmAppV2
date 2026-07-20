// src/components/CMS/components/PostGrid.tsx
import { useMemo } from 'react';
import type { CmsPost } from "../../../models/interfaces/Post";
import DataGrid from '../../common/dataGrid/dataGrid';
import Avatar from "../../common/Avatar";
import ActionButtons from '../../common/dataGrid/actionButton';
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

            cellRenderer: ({ data }: any) => (

                <Avatar

                    imageUrl={data.featured_image?.url}

                    alt={data.title}

                    size={36}

                    rounded="md"

                />

            )
        },

        {
            headerName: "Title",
            field: "title",
            flex: 2
        },

        {
            headerName: "Slug",
            field: "slug",
            flex: 1.5
        },

        {
            headerName: "Category",

            cellRenderer: ({ data }: any) =>

                data.category
                    ? data.category.name
                    : "-"
        },

        {
            headerName: "Status",

            cellRenderer: ({ data }: any) =>

                <PostStatusBadge
                    status={data.status}
                />

        },

        {
            headerName: "Featured",

            cellRenderer: ({ data }: any) =>

                data.is_featured
                    ? <Badge label="Featured" variant="success" />
                    : null
        },

        {
            headerName: "Views",
            field: "view_count",
            width: 100
        },

        {
            headerName: "Published",

            cellRenderer: ({ data }: any) =>

                data.published_at
        },

        {
            headerName: "Author",

            cellRenderer: ({ data }: any) =>

                data.author.username
        },

        {
            headerName: "Actions",

            width: 120,

            pinned: "right",

            cellRenderer: ({ data }: any) =>

                <ActionButtons

                    row={data}

                    onEdit={onEdit}

                    onDelete={onDelete}

                />

        }

    ], []);

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