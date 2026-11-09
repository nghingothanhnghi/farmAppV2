// src/components/CMS/components/PostFilterBar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { IconArrowsSort, IconSearch, IconX } from "@tabler/icons-react";
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
            if (seen.has(c.id)) continue; // defensive: never loop on bad data
            seen.add(c.id);
            out.push({ category: c, depth });
            walk(c.id, depth + 1, seen);
        }
    };
    walk(null, 0, new Set());
    // orphans (parent missing from the list) still need to be selectable
    const listed = new Set(out.map((o) => o.category.id));
    for (const c of cats) if (!listed.has(c.id)) out.push({ category: c, depth: 0 });
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
    // Typing updates local state immediately; the URL/query only after a short pause.
    const [searchText, setSearchText] = useState(filters.search);

    useEffect(() => {
        setSearchText(filters.search); // e.g. after "Clear filters"
    }, [filters.search]);

    useEffect(() => {
        if (searchText.trim() === filters.search.trim()) return;
        const timer = setTimeout(() => onChange({ search: searchText }), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText]);

    const categoryOptions = useMemo(() => orderedCategories(categories), [categories]);

    return (
        <div className="flex flex-wrap items-end gap-3 pb-4">
            <div className="relative min-w-[220px] flex-1">
                <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <FormInput
                    id="post_search"
                    type="text"
                    className="w-full [&_input]:pl-9"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search title or excerpt…"
                />
            </div>

            <FormSelect
                className="w-[170px]"
                id="post_filter_status"
                value={filters.status}
                onChange={(e) => onChange({ status: e.target.value as PostFilters["status"] })}
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

            <FormSelect
                className="w-[170px]"
                id="post_filter_type"
                value={filters.post_type}
                onChange={(e) => onChange({ post_type: e.target.value as PostFilters["post_type"] })}
            >
                <option value="">Posts & pages</option>
                <option value="post">Posts</option>
                <option value="page">Pages</option>
            </FormSelect>

            <FormSelect
                className="w-[170px]"
                id="post_filter_category"
                value={filters.category_id ?? ""}
                onChange={(e) => onChange({ category_id: e.target.value ? Number(e.target.value) : null })}
            >
                <option value="">All categories</option>
                {categoryOptions.map(({ category, depth }) => (
                    <option key={category.id} value={category.id}>
                        {"— ".repeat(depth)}{category.name}
                    </option>
                ))}
            </FormSelect>

            {filters.category_id && (
                <label
                    htmlFor="post_filter_sub"
                    className="flex items-center gap-2 pb-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none"
                >
                    <input
                        id="post_filter_sub"
                        type="checkbox"
                        checked={filters.include_descendants}
                        onChange={(e) => onChange({ include_descendants: e.target.checked })}
                    />
                    Include subcategories
                </label>
            )}

            <FormSelect
                className="w-[170px]"
                id="post_filter_tag"
                value={filters.tag_id ?? ""}
                onChange={(e) => onChange({ tag_id: e.target.value ? Number(e.target.value) : null })}
            >
                <option value="">All tags</option>
                {tags.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </FormSelect>

            <FormSelect
                className="w-[170px]"
                id="post_filter_featured"
                value={filters.is_featured === null ? "" : String(filters.is_featured)}
                onChange={(e) =>
                    onChange({ is_featured: e.target.value === "" ? null : e.target.value === "true" })
                }
            >
                <option value="">Featured or not</option>
                <option value="true">Featured only</option>
                <option value="false">Not featured</option>
            </FormSelect>

            <div className="flex items-end gap-2">
                <FormSelect
                className="w-[170px]"
                    id="post_sort"
                    value={filters.sort}
                    onChange={(e) => onChange({ sort: e.target.value as PostFilters["sort"] })}
                >
                    <option value="created_at">Sort: created</option>
                    <option value="published_at">Sort: published</option>
                    <option value="title">Sort: title</option>
                    <option value="view_count">Sort: views</option>
                </FormSelect>
                <span title={filters.order === "desc" ? "Descending (click for ascending)" : "Ascending (click for descending)"}>
                    <Button
                        type="button"
                        iconOnly
                        variant="secondary"
                        rounded="lg"
                        icon={<IconArrowsSort size={16} className={filters.order === "asc" ? "rotate-180" : ""} />}
                        onClick={() => onChange({ order: filters.order === "desc" ? "asc" : "desc" })}
                    />
                </span>
            </div>

            {activeCount > 0 && (
                <Button
                    type="button"
                    label={`Clear filters (${activeCount})`}
                    variant="secondary"
                    rounded="lg"
                    icon={<IconX size={16} />}
                    iconPosition="left"
                    onClick={onReset}
                />
            )}
        </div>
    );
};

export default PostFilterBar;
