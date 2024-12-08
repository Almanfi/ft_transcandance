/*
 * Routing Schema
 * 
 * Each route is an object with the following structure:
 * {
 *   path: "/pathname",           // The URL path for the route
 *   default: true/false,         // (Optional) Default route
 *   utils: ["utility1", ...]     // (Optional) List of utilities for this route
 * }
 *
 * Example:
 * const Routes = [
 *   { path: "/home", utils: ["navbar", "footer"], default: true }
 *   { path: "/home/user", utils: ["navbar", "footer"], default: true }
 * ];
 */

const Routes = [
  { path: "/home", utils: ["navbar"], default: true },
  { path: "/home/user", utils: ["button"] },
  { path: "/about", utils: ["header"] }
];

export default Routes;
