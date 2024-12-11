import { readdirSync, existsSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { source } from "./utils.js"

let routes = {};
let styles = [];

function generateRoutes(dir, parent, adding) {
  readdirSync(dir, { withFileTypes: true }).forEach(sub => {
    let tmp = adding;

    if (sub.isDirectory()) {
      const currRoute = `${parent}/${sub.name}`;
      let file = null;

      if (adding) {
        [".js", ".jsx", ".ts", ".tsx"].forEach(ext => {
          const curr = join(dir, sub.name, `${sub.name}${ext}`);
          if (existsSync(curr)) {
            file = curr;
            return;
          }
        });

        if (file !== null) {
          routes[currRoute] = `.${parent.slice(1)}/${sub.name}/${sub.name}.js`;
        } else {
          adding = false;
        }
      }

      generateRoutes(join(dir, sub.name), currRoute, adding);
    } else if (sub.isFile() && /\.(css|scss)$/i.test(sub.name)) {
      styles.push(`./${parent.slice(1)}/${basename(sub.name).replace(/\.(scss)$/i, ".css")}`);
    }

    adding = tmp;
  });
}

export function updateRoutes(source, defaultRoute) {
  routes = {};
  styles = [];
  const pagesDir = join(source, '/pages');

  generateRoutes(pagesDir, '', true);

  const output = `
/*
 * Routing Schema
 * Each route is an object with the following structure:
 * {
 *   "/pathname": Component,      
 *    // key is The URL path for the route
 *    // '*' is for default route, will be redirected to if navigate
 *    // Component: the component that will be displayed
 * }
 *
 * Example:
 * const Routes = {
 *    "/home": Home,
 *    "/user": User,
 *    "/user/setting": Setting
 * }
 */

import Ura from "ura";
import "./styles.js";

${Object.entries(routes).map(([key, path]) => `import ${basename(path, '.js')} from "${path}";`).join('\n')}

Ura.setRoutes({
  "*": ${basename(routes[defaultRoute] || Object.values(routes)[0], '.js')},
  ${Object.entries(routes).map(([key, path]) => `"${key}": ${basename(path, '.js')}`).join(',\n  ')}
});

Ura.start();`;

  writeFileSync(join(pagesDir, '_routes.js'), output, 'utf8');
  const stylesbuff = `import Ura from 'ura'
const styles = ${JSON.stringify(styles, null, 2)};
Ura.setStyles(styles)
`
  writeFileSync(join(pagesDir, 'styles.js'), stylesbuff, 'utf8');

  console.log("Routes and styles updated.");
}

updateRoutes(source, "/home");