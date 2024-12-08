/*
 * Routing Schema
 * 
 * Each route is an object with the following structure:
 * {
 *   path: "/pathname",           // The URL path for the route
 *   default: true/false,         // (Optional) Default route
 *   components: ["utility1", ...]     // (Optional) List of utilities for this route
 * }
 *
 * Example:
 * const Routes = [
 *   { path: "/home", components: ["navbar", "footer"], default: true }
 *   { path: "/home/user", components: ["navbar", "footer"], default: true }
 * ];
 */

const Routes = [
  { path: "*", components: ["navbar", "button"]},
  { path: "/home", components: ["navbar"], default: true },
  { path: "/home/user", components: ["button"] },
  { path: "/about", components: ["header", "button"] }
];

export default Routes;
