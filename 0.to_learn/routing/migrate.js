import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, basename, dirname } from "path";
import { fileURLToPath } from "url";
import Routes from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const currDir = join(__dirname, "/pages");

const createFile = (filePath, content) => {
  if (!existsSync(filePath)) {
    writeFileSync(filePath, content);
  }
};

function processRoute(route, parentDir = "") {
  const isRootRoute = route.path === "*";
  const routeDir = isRootRoute ? currDir : join(currDir, parentDir, route.path);

  if (!isRootRoute) {
    mkdirSync(routeDir, { recursive: true });

    const routeFile = join(routeDir, `${basename(routeDir)}.jsx`);
    createFile(
      routeFile,
      `// Route component for ${route.path}\nexport default function ${basename(route.path).replace(
        /\W/g,
        "_"
      )}() {\n  return <div>${route.path}</div>;\n}`
    );

    const styleFile = join(routeDir, `${basename(route.path)}.css`);
    createFile(styleFile, `/* Styles for ${route.path} */`);
  }

  // Create utility components
  if (route.components) {
    const utilsDir = join(routeDir, "_utils");
    mkdirSync(utilsDir, { recursive: true });

    route.components.forEach((util) => {
      createFile(join(utilsDir, `${util}.jsx`), `// Utility component ${util}`);
      createFile(join(utilsDir, `${util}.css`), `/* Styles for ${util} */`);
    });
  }

  // Process children routes recursively
  route.children?.forEach((child) =>
    processRoute(child, join(parentDir, route.path))
  );
}

// Process all routes
Routes.forEach((route) => processRoute(route));
