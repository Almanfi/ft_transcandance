#!/usr/bin/env node
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname, basename } from "path";
import { GET } from "./utils.js";

if (process.argv.length < 3) {
  console.error("Usage: ura-gen <route1> <route2> ...");
  process.exit(1);
}

const capitalize = (name) => name.charAt(0).toUpperCase() + name.slice(1);

const ensureDirectoryExists = (filePath) => {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};

const createFile = (filePath, content) => {
  ensureDirectoryExists(filePath);
  if (!existsSync(filePath)) {
    writeFileSync(filePath, content);
    console.log(`Created: ${filePath}`);
  } else {
    console.warn(`Skipped (already exists): ${filePath}`);
  }
};

const generateComponent = (name) => {
  const isTailwind = GET("STYLE_EXTENTION") === "tailwind";
  const isTS = ["ts", "tsx"].includes(GET("EXTENSION"));

  return `${isTS ? '//@ts-ignore\n' : ""}import Ura${isTS ? ", { VDOM, Props }" : ""} from 'ura';

function ${capitalize(name)}(props${isTS ? ": Props" : ""} = {})${isTS ? ": VDOM" : ""} {
  const [render, State] = Ura.init();
  const [getter, setter] = State${isTS ? "<number>" : ""}(0);

  return render(() => (
    <div className="${isTailwind ? "flex flex-col items-center justify-center text-center h-full w-full bg-[#282c34] text-white" : name.toLowerCase()}">
      <h1 className="${isTailwind ? "text-4xl mb-4" : ""}">
        Hello from ${capitalize(name)} component!
      </h1>
      <button className="${isTailwind ?
      "h-[100px] w-[100px] text-lg font-bold bg-[#3178c6] text-white border-none rounded-full cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white hover:text-[#3178c6]" : ""}" 
        onclick={() => setter(getter() + 1)}>
        Click me [{getter()}]
      </button>
    </div>
  ));
}

export default ${capitalize(name)};
`;
};

const generateStyle = (name) => {
  const styleTemplate = `.${name} {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  width: 100%;
  background: #282c34;
  color: #ffffff;
}

.${name} h1 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: #ffffff;
}

.${name} button {
  height: 120px;
  width: 120px;
  font-size: 20px;
  font-weight: bold;
  background-color: #3178c6;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.${name} button:hover {
  background-color: #ffffff;
  color: #3178c6;
}`;

  return GET("STYLE_EXTENTION") === "scss" ? styleTemplate.replace(/(?<=\}\n)/g, "  ") : styleTemplate;
};

process.argv.slice(2).forEach((route) => {
  const dir = dirname(route);
  const name = basename(route);
  const ext = GET("EXTENSION");
  const styleExt = GET("STYLE_EXTENTION");

  createFile(join(process.cwd(), join(dir, `/${name}/`), `${name}.${ext}`), generateComponent(name));
  if (["css", "scss"].includes(styleExt)) {
    createFile(join(process.cwd(), join(dir, `/${name}/`), `${name}.${styleExt}`), generateStyle(name));
  }
});
