// src/components/CMS/components/PostFilterBar.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    IconArrowsSort,
    IconSearch,
    IconX,
    IconAdjustmentsHorizontal,
} from "@tabler/icons-react";
import { FormInput, FormSelect } from "../../common/Form";
import Button from "../../common/Button";
import type { CmsCategory, CmsTag } from "../../../models/interfaces/Post";
import type { PostFilters } from "../../../hooks/usePostFilters";

interface Props {
    filters: PostFilters;
    onChange: (patch: Partial<PostFilters>) => void;
    onReset: () => void;
    activeCount: number;
    categories: CmsCategory[];
    tags: CmsTag[];
    /** Non-editors may only ask for "published" (other statuses are 403). */
    isEditor: boolean;
}

const SEARCH_DEBOUNCE_MS = 400;

/** Categories as a depth-first list so children appear under their parent. */
const orderedCategories = (cats: CmsCategory[]) => {
    const byParent = new Map<number | null, CmsCategory[]>();

    for (const c of cats) {
        const key = c.parent_id ?? null;
        byParent.set(key, [...(byParent.get(key) ?? []), c]);
    }

    const out: { category: CmsCategory; depth: number }[] = [];

    const walk = (parent: number | null, depth: number, seen: Set<number>) => {
        for (const c of byParent.get(parent) ?? []) {
            if (seen.has(c.id)) continue;

            seen.add(c.id);
            out.push({ category: c, depth });
            walk(c.id, depth + 1, seen);
        }
    };

    walk(null, 0, new Set());

    // Orphans (parent missing from the list) still need to be selectable.
    const listed = new Set(out.map((o) => o.category.id));

    for (const c of cats) {
        if (!listed.has(c.id)) {
            out.push({ category: c, depth: 0 });
        }
    }

    return out;
};

const PostFilterBar: React.FC<Props> = ({
    filters,
    onChange,
    onReset,
    activeCount,
    categories,
    tags,
    isEditor,
}) => {
    const [expanded, setExpanded] = useState(false);

    // Typing updates local state immediately; the URL/query only after a short pause.
    const [searchText, setSearchText] = useState(filters.search);

    useEffect(() => {
        setSearchText(filters.search);
    }, [filters.search]);

    useEffect(() => {
        if (searchText.trim() === filters.search.trim()) return;

        const timer = setTimeout(
            () => onChange({ search: searchText }),
            SEARCH_DEBOUNCE_MS
        );

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText]);

    const categoryOptions = useMemo(
        () => orderedCategories(categories),
        [categories]
    );

    const clearFilters = () => {
        onReset();
        setExpanded(false);
    };

    return (
        <div className="flex flex-col items-center pb-4">
            {/* Search and basic sorting */}
            <div
                className={`flex w-full items-center gap-2 transition-all duration-300 ${
                    expanded
                        ? "max-w-5xl"
                        : "sm:w-full lg:w-2/3"
                }`}
            >
                {/* Search */}
                <div className="relative min-w-0 flex-1">
                    <FormInput
                        id="post_search"
                        type="text"
                        className="w-full [&_input]:pr-10"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search title or excerpt..."
                    />

                    {!searchText ? (
                        <IconSearch
                            size={18}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                    ) : (
                        <Button
                            type="button"
                            variant="secondary"
                            icon={<IconX size={16} />}
                            iconOnly
                            label="Clear search"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent"
                            onClick={() => setSearchText("")}
                            rounded="full"
                            size="xxs"
                        />
                    )}
                </div>

                {/* Sort by */}
                <div className="flex shrink-0 items-center gap-1">
                    <FormSelect
                        className="w-[145px] sm:w-[170px]"
                        id="post_sort"
                        value={filters.sort}
                        onChange={(e) =>
                            onChange({
                                sort: e.target.value as PostFilters["sort"],
                            })
                        }
                    >
                        <option value="created_at">Sort: created</option>
                        <option value="published_at">Sort: published</option>
                        <option value="title">Sort: title</option>
                        <option value="view_count">Sort: views</option>
                    </FormSelect>

                    <span
                        title={
                            filters.order === "desc"
                                ? "Descending (click for ascending)"
                                : "Ascending (click for descending)"
                        }
                    >
                        <Button
                            type="button"
                            iconOnly
                            variant="secondary"
                            rounded="lg"
                            icon={
                                <IconArrowsSort
                                    size={16}
                                    className={
                                        filters.order === "asc"
                                            ? "rotate-180"
                                            : ""
                                    }
                                />
                            }
                            onClick={() =>
                                onChange({
                                    order:
                                        filters.order === "desc"
                                            ? "asc"
                                            : "desc",
                                })
                            }
                        />
                    </span>
                </div>

                {/* Toggle advanced filters */}
                <Button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    variant="link"
                    icon={<IconAdjustmentsHorizontal size={16} />}
                    iconPosition="left"
                    label={expanded ? "Hide filters" : "More filters"}
                    className="shrink-0 text-gray-700 dark:text-gray-300"
                />
            </div>

            {/* Advanced filters */}
            {expanded && (
                <div className="mt-3 grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Status */}
                    <FormSelect
                        className="w-full"
                        id="post_filter_status"
                        value={filters.status}
                        onChange={(e) =>
                            onChange({
                                status: e.target.value as PostFilters["status"],
                            })
                        }
                    >
                        <option value="">All statuses</option>
                        <option value="published">Published</option>

                        {isEditor && (
                            <>
                                <option value="draft">Draft</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="archived">Archived</option>
                            </>
                        )}
                    </FormSelect>

                    {/* Post type */}
                    <FormSelect
                        className="w-full"
                        id="post_filter_type"
                        value={filters.post_type}
                        onChange={(e) =>
                            onChange({
                                post_type: e.target.value as PostFilters["post_type"],
                            })
                        }
                    >
                        <option value="">Posts & pages</option>
                        <option value="post">Posts</option>
                        <option value="page">Pages</option>
                    </FormSelect>

                    {/* Category */}
                    <FormSelect
                        className="w-full"
                        id="post_filter_category"
                        value={filters.category_id ?? ""}
                        onChange={(e) =>
                            onChange({
                                category_id: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                            })
                        }
                    >
                        <option value="">All categories</option>

                        {categoryOptions.map(({ category, depth }) => (
                            <option key={category.id} value={category.id}>
                                {"— ".repeat(depth)}
                                {category.name}
                            </option>
                        ))}
                    </FormSelect>

                    {/* Tag */}
                    <FormSelect
                        className="w-full"
                        id="post_filter_tag"
                        value={filters.tag_id ?? ""}
                        onChange={(e) =>
                            onChange({
                                tag_id: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                            })
                        }
                    >
                        <option value="">All tags</option>

                        {tags.map((tag) => (
                            <option key={tag.id} value={tag.id}>
                                {tag.name}
                            </option>
                        ))}
                    </FormSelect>

                    {/* Include subcategories */}
                    {filters.category_id && (
                        <label
                            htmlFor="post_filter_sub"
                            className="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                        >
                            <input
                                id="post_filter_sub"
                                type="checkbox"
                                checked={filters.include_descendants}
                                onChange={(e) =>
                                    onChange({
                                        include_descendants: e.target.checked,
                                    })
                                }
                            />
                            Include subcategories
                        </label>
                    )}

                    {/* Featured */}
                    <FormSelect
                        className="w-full"
                        id="post_filter_featured"
                        value={
                            filters.is_featured === null
                                ? ""
                                : String(filters.is_featured)
                        }
                        onChange={(e) =>
                            onChange({
                                is_featured:
                                    e.target.value === ""
                                        ? null
                                        : e.target.value === "true",
                            })
                        }
                    >
                        <option value="">Featured or not</option>
                        <option value="true">Featured only</option>
                        <option value="false">Not featured</option>
                    </FormSelect>

                    {/* Clear all filters */}
                    {activeCount > 0 && (
                        <div className="flex items-center">
                            <Button
                                type="button"
                                label={`Clear filters (${activeCount})`}
                                variant="secondary"
                                rounded="lg"
                                icon={<IconX size={16} />}
                                iconPosition="left"
                                onClick={clearFilters}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostFilterBar;

