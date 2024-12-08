/*
 * Routing Schema
 * 
 * Each route is an object with the following structure:
 * {
 *   path: "/pathname",           // The URL path for the route
 *   default: true/false,         // (Optional) Default route
 *   children: [                  // (Optional) Nested sub-routes
 *     { path: "/subpath", utils: ["utility1"] }
 *   ],
 *   utils: ["utility1", ...]     // (Optional) List of utilities for this route
 * }
 *
 * Example:
 * const Routes = [
 *   {
 *     path: "/home",
 *     default: true,
 *     children: [
 *       { path: "/user", utils: ["user-navbar"] },
 *       { path: "/settings", utils: ["settings-navbar"] }
 *     ],
 *     utils: ["navbar", "footer"]
 *   }
 * ];
 */

const Routes = [
  {
    path: "/home",
    default: true,
    children: [
      { path: "/user", utils: ["user-navbar"] },
      { path: "/settings", utils: ["settings-navbar"] }
    ],
    utils: ["navbar", "footer"]
  },
  {
    path: "/about",
    children: [],
    utils: ["header"]
  }
];

export default Routes;
