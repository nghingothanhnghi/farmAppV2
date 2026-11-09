// src/api/schemaCheck.ts
// Compile-time only (no runtime code). Asserts that our hand-written REQUEST types are accepted by the
// backend's generated request types. If the backend renames/removes a field or changes an enum, `tsc`
// fails here instead of the app failing at runtime. Regenerate with `npm run gen:api`.
import type { components, paths } from "./schema";
import type { CmsPostCreate, CmsPostUpdate, CmsTagUpdate } from "../models/interfaces/Post";
import type { MenuInput, MenuItemInput, MenuReorderEntry } from "../models/interfaces/Menu";
import type { PostQuery } from "../services/postService";

type Schemas = components["schemas"];

/** Fails to compile unless `A` is assignable to `B`. */
type AssertAssignable<A extends B, B> = [A, B];

/**
 * openapi-typescript marks fields that have a server default (e.g. `status`, `order`) as required, because
 * that is what a RESPONSE always contains. For requests those are optional, so only `Required` keys stay required.
 */
type Request<T, Required extends keyof T> = Partial<T> & Pick<T, Required>;

export type _Checks = [
    AssertAssignable<CmsPostCreate, Request<Schemas["PostCreate"], "title">>,
    AssertAssignable<CmsPostUpdate, Schemas["PostUpdate"]>,
    AssertAssignable<MenuInput, Schemas["MenuCreate"]>,
    AssertAssignable<MenuItemInput, Request<Schemas["MenuItemCreate"], "label">>,
    AssertAssignable<MenuReorderEntry, Schemas["MenuItemReorderEntry"]>,
    AssertAssignable<CmsTagUpdate, Schemas["TagUpdate"]>,
    // GET /cms/posts query params
    AssertAssignable<PostQuery, NonNullable<paths["/cms/posts"]["get"]["parameters"]["query"]>>,
];
