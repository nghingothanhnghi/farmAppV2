// src/components/CMS/components/PostGrid.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import type { CmsPost } from "../../../models/interfaces/Post";
import DataGrid from '../../common/dataGrid/dataGrid';
import Avatar from "../../common/Avatar";
import ActionButtons from '../../common/dataGrid/actionButton';
import Button from '../../common/Button';
import Badge from '../../common/Badge';
import Modal from '../../common/Modal';
import ModeToggle from '../../common/ModeToggle';

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

            cellRenderer: ({ data }) => (

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

            cellRenderer: ({ data }) =>

                data.category
                    ? data.category.name
                    : "-"
        },

        {
            headerName: "Status",

            cellRenderer: ({ data }) =>

                <PostStatusBadge
                    status={data.status}
                />

        },

        {
            headerName: "Featured",

            cellRenderer: ({ data }) =>

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

            cellRenderer: ({ data }) =>

                data.published_at
                    ? formatDate(data.published_at)
                    : "-"
        },

        {
            headerName: "Author",

            cellRenderer: ({ data }) =>

                data.author.username
        },

        {
            headerName: "Actions",

            width: 120,

            pinned: "right",

            cellRenderer: ({ data }) =>

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