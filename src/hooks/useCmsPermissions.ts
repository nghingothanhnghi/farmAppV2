// src/hooks/useCmsPermissions.ts
// UI-only mirror of the CMS permission matrix (FRONTEND_GUIDE §4).
// The backend remains the source of truth and answers 403; this only hides/disables actions.
//   editor = super_admin | admin | moderator
//   admin  = super_admin | admin
import { useCallback } from "react";
import { useAuth } from "../contexts/authContext";
import useHasAnyRole from "./useHasAnyRole";

const EDITOR_ROLES = ["super_admin", "admin", "moderator"];
const ADMIN_ROLES = ["super_admin", "admin"];

export const useCmsPermissions = () => {
    const { user } = useAuth();
    const isEditor = useHasAnyRole(EDITOR_ROLES);
    const isAdmin = useHasAnyRole(ADMIN_ROLES);

    const isOwner = useCallback(
        (ownerId?: number | null) => !!user && ownerId != null && user.id === ownerId,
        [user]
    );

    /** Update / delete / publish / archive / schedule: own posts or any post for editors. */
    const canManagePost = useCallback(
        (post: { author?: { id: number } | null }) => isEditor || isOwner(post.author?.id),
        [isEditor, isOwner]
    );

    /** Edit alt text / delete: own uploads or anything for editors. */
    const canManageMedia = useCallback(
        (media: { uploaded_by_id?: number | null }) => isEditor || isOwner(media.uploaded_by_id),
        [isEditor, isOwner]
    );

    return {
        isEditor,
        isAdmin,
        canManagePost,
        canManageMedia,
        /** Category / tag create + update */
        canEditTaxonomy: isEditor,
        /** Category / tag delete */
        canDeleteTaxonomy: isAdmin,
        /** Menu + menu item create / update / item delete */
        canEditMenus: isEditor,
        /** Menu delete */
        canDeleteMenu: isAdmin,
    };
};
