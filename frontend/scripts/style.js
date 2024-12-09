import { join, relative } from "path";
import { statSync, readdirSync, writeFileSync } from "fs";
import * as UTILS from "./utils.js";

const { GET, source } = UTILS;
const directoryPath = join(source, "/pages");

export default function updateStyles() {
  const styles = [];

  function traverseDirectory(currentPath) {
    const files = readdirSync(currentPath);

    files.forEach(file => {
      const fullPath = join(currentPath, file);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        traverseDirectory(fullPath);
      } else if (stat.isFile() && (file.endsWith('.css') || file.endsWith('.scss'))) {
        let relativePath = relative(source, fullPath).replace(/\\/g, '/');
        if (relativePath.endsWith('.scss')) relativePath = relativePath.replace(/\.scss$/, '.css');
        if (!relativePath.includes("styles.js")) { // Exclude styles.js itself
          styles.push(`"./${relativePath}"`);
          console.log(`Added style path: ${relativePath}`);
        }
      }
    });
  }

  traverseDirectory(directoryPath);

  const content = `
import Ura from 'ura'
const styles = [
  ${styles.join(",\n  ")}
];

Ura.setStyles(styles);
`;

  writeFileSync(join(source, './pages/styles.js'), content.trim(), 'utf8');
  console.log('Finished scanning directories and generating styles.js.');
}

// updateStyles();
