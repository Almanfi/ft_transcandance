import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, basename, dirname } from "path";
import { fileURLToPath } from "url";
import Routes from "./routes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const currDir = join(__dirname, "/pages");

function createFile(type, route) {
  if (type === "utils") {

  }
  else {
    const dir = join(currDir, route.path);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `index-${basename(route.path)}.js`),
      `// Route file for ${route.path}`);
    writeFileSync(join(dir, `index-${basename(route.path)}.css`),
      `// Route file for ${route.path}`);
    route.utils?.forEach(elem=>{
      writeFileSync(join(dir, `utils-${basename(elem)}.js`),`// utils file ${elem}`);
      writeFileSync(join(dir, `utils-${basename(elem)}.css`),`// utils file ${elem}`);
    })
  }
}

Routes.forEach(route => {
  createFile("route", route)
})
