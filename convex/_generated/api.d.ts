/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as dashboard from "../dashboard.js";
import type * as generations from "../generations.js";
import type * as http from "../http.js";
import type * as posts from "../posts.js";
import type * as users from "../users.js";
import type * as zernioAccounts from "../zernioAccounts.js";
import type * as zernioAction from "../zernioAction.js";
import type * as zernioClient from "../zernioClient.js";
import type * as zernioPosts from "../zernioPosts.js";
import type * as zernioProfiles from "../zernioProfiles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  dashboard: typeof dashboard;
  generations: typeof generations;
  http: typeof http;
  posts: typeof posts;
  users: typeof users;
  zernioAccounts: typeof zernioAccounts;
  zernioAction: typeof zernioAction;
  zernioClient: typeof zernioClient;
  zernioPosts: typeof zernioPosts;
  zernioProfiles: typeof zernioProfiles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  nanoBanana: import("convex-nano-banana/_generated/component.js").ComponentApi<"nanoBanana">;
};
