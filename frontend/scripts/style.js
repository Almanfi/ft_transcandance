import { join, relative } from "path";
import { statSync, readdirSync, writeFileSync } from "fs";
import * as UTILS from "./utils.js"

const { GET, source } = UTILS;
const directoryPath = join(source, "/pages");

function updateStyle() {
  let buff = "";
  function traverseDirectory(currentPath) {
    const files = readdirSync(currentPath);

    files.forEach(file => {
      const fullPath = join(currentPath, file);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        traverseDirectory(fullPath);
      } else if (stat.isFile() && (file.endsWith('.css') || file.endsWith('.scss'))) {
        let relativePath = relative(directoryPath, fullPath).replace(/\\/g, '/');
        if (relativePath.endsWith('.scss')) relativePath = relativePath.replace(/\.scss$/, '.css');
        if (relativePath != "imports.css") {
          buff += `@import "./${relativePath}";\n`;
          console.log(`Added import for: ${relativePath}`);
        }
      }
    });
  }
  traverseDirectory(directoryPath);
  writeFileSync(join(source, './pages/imports.css'), buff, 'utf8');
  console.log('Finished scanning directories and adding imports.');
}

updateStyle();