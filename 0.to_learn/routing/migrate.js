import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, basename, dirname } from "path";
import { fileURLToPath } from "url";
import Routes from "./routes.js";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const currDir = join(__dirname, "/pages");

const createFile = (name, content) => { if (!execSync(name)) writeFileSync(name, content) }

function createRoute(type, route, parentDir = "") {
  const isRootRoute = route.path === "*";
  const routeDir = isRootRoute ? currDir : join(currDir, parentDir, route.path);

  if (type === "route") {
    if (!isRootRoute) {
      mkdirSync(routeDir, { recursive: true });
      const routeFile = join(routeDir, `${basename(routeDir)}.jsx`);
      createFile(routeFile,
        `// Route component for ${route.path}\nexport default function ${basename(route.path).replace(/\W/g, "_")}() {\n  return <div>${route.path}</div>;\n}`
      );
      const styleFile = join(routeDir, `${basename(route.path)}.css`);
      createFile(styleFile, `/* Styles for ${route.path} */`);
    }

    if (route.components) {
      const utilsDir = isRootRoute ? join(currDir, "_utils") : join(routeDir, "_utils");
      mkdirSync(utilsDir, { recursive: true });
      route.components.forEach((util) => {
        const utilFile = join(utilsDir, `${util}.jsx`);
        const utilStyleFile = join(utilsDir, `${util}.css`);
        createFile(utilFile, `// Utility component ${util}`);
        createFile(utilStyleFile, `/* Styles for ${util} */`);
      });
    }

    // Process children routes recursively
    if (route.children) {
      route.children.forEach((child) =>
        createRoute("route", child, join(parentDir, route.path))
      );
    }
  }
}

// Process all routes
Routes.forEach((route) => {
  createRoute("route", route);
});
