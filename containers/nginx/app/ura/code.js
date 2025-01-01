import * as UTILS from "./utils.js";
const { IF, ELSE, LOOP, EXEC, CREATE, REPLACE, REMOVE } = UTILS;
const { ELEMENT, FRAGMENT, TEXT } = UTILS;
const { deepEqual, loadCSS, svgElements } = UTILS;
let ifTag = null;
// JSX
function check(children) {
    //@ts-ignore
    return children.map((child) => {
        if (child === null || child === undefined || typeof child === "string" || typeof child === "number") {
            return {
                type: TEXT,
                props: {
                    value: child,
                }
            };
        }
        return child;
    });
}
function fr(props, ...children) {
    return {
        type: FRAGMENT,
        children: children || [],
    };
    throw "Fragments (<></>) are not supported please use <fr></fr> tag instead";
}
function deepcopy(value) {
    if (value === null || value === undefined)
        return value;
    if (Array.isArray(value))
        return value.map(deepcopy);
    if (typeof value === "object") {
        const copy = {};
        for (const key in value) {
            if (value.hasOwnProperty(key))
                copy[key] = deepcopy(value[key]);
        }
        return copy;
    }
    return value;
}
function e(tag, props = {}, ...children) {
    if (typeof tag === "function") {
        let functag = null;
        try {
            functag = tag(props || {}, children);
            if (!functag) {
                return {
                    type: FRAGMENT,
                    children: [],
                };
            }
            if (!functag)
                throw `function must return render(()=>(JSX)): ${tag}`;
        }
        catch (error) {
            console.error(error);
            return {
                type: FRAGMENT,
                children: [],
            };
        }
        if (functag.type === FRAGMENT)
            functag = e("fr", functag.props, ...check(children || []));
        return functag;
    }
    if (tag === "if") {
        let res = {
            type: IF,
            tag: "if",
            props: props,
            children: check(props.cond && children.length ? children : []),
        };
        ifTag = res;
        return res;
    }
    else if (tag === "else") {
        // console.log("handle else");
        // console.log("this is if tag", ifTag);
        let res = {
            type: ELSE,
            tag: "else",
            props: ifTag?.props,
            children: check(ifTag && !ifTag.props.cond && children.length ? children : []),
        };
        return res;
    }
    else if (tag === "exec") {
        return {
            type: EXEC,
            tag: "exec",
            call: props.call,
            children: []
        };
    }
    else if (tag === "loop" || tag === "dloop") {
        let loopChildren = (props.on || []).flatMap((elem, id) => (children || []).map((child) => {
            const evaluatedChild = 
            //@ts-ignore
            typeof child === "function" ? child(elem, id) : child;
            // I commented this line it caused me problem 
            // in slider when copying input that has function onchange
            // return structuredClone ? structuredClone(evaluatedChild)
            //   : JSON.parse(JSON.stringify(evaluatedChild));
            // return JSON.parse(JSON.stringify(evaluatedChild));
            return deepcopy(evaluatedChild);
        }));
        if (tag === "dloop")
            loopChildren = loopChildren.concat(loopChildren.map(deepcopy));
        let res = {
            type: LOOP,
            tag: "loop",
            props: props,
            children: check(loopChildren || []),
        };
        return res;
    }
    return {
        tag: tag,
        type: ELEMENT,
        props: props,
        children: check(children || []),
    };
}
// DOM
function setProps(vdom) {
    const { tag, props } = vdom;
    const style = {};
    Object.keys(props || {}).forEach((key) => {
        if (key === "class") {
            console.warn("Invalid property 'class' did you mean 'className' ?", vdom);
            key = "className";
        }
        if (key.startsWith("on")) {
            const eventType = key.slice(2).toLowerCase();
            if (eventType === "hover") {
                vdom.dom.addEventListener("mouseover", props[key]);
                vdom.dom.addEventListener("mouseout", props[key]);
            }
            else
                vdom.dom.addEventListener(eventType, props[key]);
        }
        else if (key === "style")
            Object.assign(style, props[key]);
        else {
            if (svgElements.has(tag))
                vdom.dom.setAttribute(key, props[key]);
            else
                vdom.dom[key] = props[key];
        }
    });
    if (Object.keys(style).length > 0) {
        vdom.dom.style.cssText = Object.keys(style)
            .map((styleProp) => {
            const Camelkey = styleProp.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
            return `${Camelkey}:${style[styleProp]}`;
        })
            .join(";");
    }
}
let ExecStack = [];
function createDOM(vdom) {
    // console.log(vdom);
    switch (vdom.type) {
        case ELEMENT: {
            switch (vdom.tag) {
                case "root":
                    {
                        vdom.dom = document.getElementById("root");
                        break;
                    }
                default:
                    if (vdom.dom)
                        console.error("e already has dom"); // TODO: to be removed
                    else {
                        if (svgElements.has(vdom.tag))
                            vdom.dom = document.createElementNS("http://www.w3.org/2000/svg", vdom.tag);
                        else
                            vdom.dom = document.createElement(vdom.tag);
                    }
                    break;
            }
            break;
        }
        case FRAGMENT: {
            // console.log("createDOM: found fr", vdom);
            if (vdom.dom)
                console.error("fr already has dom"); // TODO: to be removed
            vdom.dom = document.createElement("container");
            // vdom.dom = document.createDocumentFragment()
            break;
        }
        case TEXT: {
            vdom.dom = document.createTextNode(vdom.props.value);
            break;
        }
        case IF:
        case ELSE:
        case LOOP: {
            vdom.dom = document.createElement(vdom.tag);
            // keep it commented it causes problem when condition change
            // vdom.dom = document.createDocumentFragment();
            break;
        }
        case EXEC: {
            ExecStack.push(vdom.call);
            // console.log("found exec", vdom);
            // vdom.call();
            vdom.dom = document.createElement("exec");
            break;
        }
        default:
            break;
    }
    setProps(vdom);
    return vdom;
}
function removeProps(vdom) {
    const props = vdom.props;
    Object.keys(props || {}).forEach((key) => {
        if (key.startsWith("on")) {
            const eventType = key.slice(2).toLowerCase();
            vdom.dom.removeEventListener(eventType, props[key]);
        }
        else if (key === "style") {
            Object.keys(props.style || {}).forEach((styleProp) => {
                vdom.dom.style[styleProp] = "";
            });
        }
        else {
            if (vdom.dom[key] !== undefined)
                delete vdom.dom[key];
            else
                vdom.dom.removeAttribute(key);
        }
    });
    vdom.props = {};
}
function destroy(vdom) {
    removeProps(vdom);
    vdom.dom?.remove();
    vdom.dom = null;
    vdom.children?.map(destroy);
}
// RENDERING
function execute(mode, prev, next = null) {
    switch (mode) {
        case CREATE: {
            createDOM(prev);
            // console.log("prev", prev);
            prev.children?.map((child) => {
                child = execute(mode, child);
                if (child.dom)
                    prev.dom.appendChild(child.dom);
            });
            break;
        }
        case REPLACE: {
            execute(CREATE, next);
            prev.dom.replaceWith(next.dom);
            prev.dom = next.dom;
            // prev.children?.map(destroy)
            prev.children = next.children;
            // I commented it because it caused me an error
            // in the slider
            // removeProps(prev);
            prev.props = next.props;
            break;
        }
        case REMOVE: {
            destroy(prev);
            break;
        }
        default:
            break;
    }
    return prev;
}
// RECONCILIATION
function reconciliateProps(oldProps = {}, newProps = {}, vdom) {
    oldProps = oldProps || {};
    newProps = newProps || {};
    let diff = false;
    Object.keys(oldProps || {}).forEach((key) => {
        if (!newProps.hasOwnProperty(key) ||
            !deepEqual(oldProps[key], newProps[key])) {
            diff = true;
            if (key.startsWith("on")) {
                const eventType = key.slice(2).toLowerCase();
                vdom.dom.removeEventListener(eventType, oldProps[key]);
            }
            else if (key === "style") {
                Object.keys(oldProps.style || {}).forEach((styleProp) => {
                    vdom.dom.style[styleProp] = "";
                });
            }
            else {
                if (vdom.dom[key] !== undefined)
                    delete vdom.dom[key];
                else {
                    try {
                        vdom.dom.removeAttribute(key);
                    }
                    catch (error) {
                        console.error("found error while removing", vdom);
                    }
                    // vdom.dom.removeAttribute(key);
                }
            }
        }
    });
    Object.keys(newProps || {}).forEach((key) => {
        if (!oldProps.hasOwnProperty(key) ||
            !deepEqual(oldProps[key], newProps[key])) {
            diff = true;
            if (key.startsWith("on")) {
                const eventType = key.slice(2).toLowerCase();
                vdom.dom.addEventListener(eventType, newProps[key]);
            }
            else if (key === "style")
                Object.assign(vdom.dom.style, newProps[key]);
            else {
                if (vdom.tag === "svg" || vdom.dom instanceof SVGElement)
                    vdom.dom.setAttribute(key, newProps[key]);
                else
                    vdom.dom[key] = newProps[key];
            }
        }
    });
    return diff;
}
function reconciliate(prev, next) {
    if (prev.type != next.type || prev.tag != next.tag)
        return execute(REPLACE, prev, next);
    if ((prev.tag === next.tag || prev.type === TEXT) && reconciliateProps(prev.props, next.props, prev)) {
        return execute(REPLACE, prev, next);
    }
    if (next.type === EXEC) {
        console.log("replace exec");
        prev.call();
        next.call();
        // return execute(REPLACE, prev, next);
    }
    const prevs = prev.children || [];
    const nexts = next.children || [];
    for (let i = 0; i < Math.max(prevs.length, nexts.length); i++) {
        let child1 = prevs[i];
        let child2 = nexts[i];
        if (child1 && child2) {
            reconciliate(child1, child2);
        }
        else if (!child1 && child2) {
            execute(CREATE, child2);
            prevs.push(child2);
            prev.dom.appendChild(child2.dom);
        }
        else if (child1 && !child2) {
            execute(REMOVE, child1);
            prevs.splice(i, 1);
            i--;
        }
    }
}
let GlobalVDOM = null;
function display(vdom) {
    console.log("display ", vdom);
    if (GlobalVDOM)
        reconciliate(GlobalVDOM, vdom);
    else {
        execute(CREATE, vdom);
        GlobalVDOM = vdom;
    }
    // ExecStack.forEach(event => event());
    // ExecStack = [];
}
function init() {
    let index = 1;
    let vdom = null;
    let states = {};
    let View = () => Ura.e("empty", null);
    const State = (initValue) => {
        const stateIndex = index++;
        states[stateIndex] = initValue;
        const getter = () => states[stateIndex];
        const setter = (newValue) => {
            // console.log("call setter", deepEqual(states[stateIndex], newValue));
            if (!deepEqual(states[stateIndex], newValue)) {
                // console.log("call update for", newValue);
                states[stateIndex] = newValue;
                updateState();
            }
        };
        return [getter, setter];
    };
    const ForcedState = (initValue) => {
        const stateIndex = index++;
        states[stateIndex] = initValue;
        const getter = () => states[stateIndex];
        const setter = (newValue) => {
            states[stateIndex] = newValue;
            // updateState();
            const newVDOM = Ura.e(View, null);
            if (vdom)
                execute(REPLACE, vdom, newVDOM);
            else
                vdom = newVDOM;
        };
        return [getter, setter];
    };
    const updateState = () => {
        const newVDOM = Ura.e(View, null);
        if (vdom)
            reconciliate(vdom, newVDOM);
        else
            vdom = newVDOM;
    };
    const render = (call) => {
        View = call;
        updateState();
        return vdom;
    };
    return [render, State, ForcedState];
}
// ROUTING
function Error(props) {
    const [render, State] = init();
    return render(() => {
        return e("h4", {
            style: {
                fontFamily: "sans-serif",
                fontSize: "6vw",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                height: "100%",
            },
        }, "Error: [", props.message, "] Not Found, check browser console");
    });
}
const Routes = {};
Routes["*"] = () => Error({ message: window.location.pathname });
function cleanPath(path) {
    if (path === "*")
        return path;
    if (!path.startsWith("/"))
        path = "/" + path;
    path = path.replace(/\/+/g, "/");
    if (path.length > 1 && path.endsWith("/"))
        path = path.slice(0, -1);
    return path;
}
function setRoute(path, call) {
    Routes[path] = call;
}
function getRoute(path) {
    return Routes[cleanPath(path)] || Routes["*"];
}
function setRoutes(currRoutes) {
    Object.keys(currRoutes).forEach(key => {
        setRoute(cleanPath(key), currRoutes[key]);
    });
}
function normalizePath(path) {
    if (!path || path == "")
        return "/";
    path = path.replace(/^\s+|\s+$/gm, "");
    if (!path.startsWith("/"))
        path = "/" + path;
    path = path.replace(/\/{2,}/g, "/");
    if (path.length > 1 && path.endsWith("/"))
        path = path.slice(0, -1);
    return path;
}
function refresh(params = {}) {
    let path = window.location.pathname || "/";
    path = normalizePath(path);
    const RouteConfig = getRoute(path);
    // console.log("go to", path);
    return display(Ura.e("root", null, 
    //@ts-ignore
    Ura.e(RouteConfig, { props: params })));
}
function navigate(route, params = {}) {
    route = route.split("?")[0];
    route = normalizePath(route);
    console.log("navigate to", route, "with", params);
    window.history.pushState({}, "", `${route}`);
    refresh(params);
}
// loadfiles
async function loadRoutes() {
    try {
        const response = await fetch("/pages/routes.json");
        const data = await response.json();
        // console.log("data", data);
        return data;
    }
    catch (error) {
        console.error("Error loading routes.json:", error);
        throw error;
    }
}
function loadCSSFiles(styles) {
    styles?.forEach((style) => {
        Ura.loadCSS(Ura.normalizePath(style));
    });
}
async function loadJSFiles(routes, base) {
    for (const route of Object.keys(routes)) {
        try {
            const module = await import(routes[route]);
            if (!module.default) {
                throw `${route}: ${routes[route]} must have a default export`;
            }
            Ura.setRoute(Ura.normalizePath(route), module.default);
            if (base && route === base) {
                Ura.setRoute("*", module.default);
            }
        }
        catch (error) {
            console.error("Error loading JavaScript module:", error);
        }
    }
}
function setEventListeners() {
    window.addEventListener("hashchange", Ura.refresh);
    window.addEventListener("DOMContentLoaded", Ura.refresh);
    window.addEventListener("popstate", Ura.refresh);
    // window.addEventListener("storage", (event) => {
    //   if (event.key === 'ura-store') {
    //     // refresh();
    //     // window.location.reload();
    //   }
    // });
}
function handleCSSUpdate(filename) {
    const path = normalizePath("/" + filename);
    // console.log("css:", path);
    let found = false;
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        //@ts-ignore
        const linkUri = new URL(link.href).pathname;
        // console.log("old", linkUri);
        if (linkUri === path) {
            // console.log("found");
            found = true;
            const newLink = link.cloneNode();
            //@ts-ignore
            newLink.href = link.href.split("?")[0] + "?t=" + new Date().getTime(); // Append timestamp to force reload
            link.parentNode.replaceChild(newLink, link);
            return;
        }
    });
    if (!found) {
        // console.log("CSS file not found in <link> tags. Adding it.");
        loadCSS(path);
    }
}
async function sync() {
    const ws = new WebSocket(`ws://${window.location.host}`);
    console.log(window.location.host);
    ws.onmessage = async (socket_event) => {
        const event = JSON.parse(socket_event.data);
        if (event.action === "update") {
            if (event.type === "css") {
                handleCSSUpdate(event.filename);
            }
            else if (event.type === "js") {
                //  try {
                //     const scriptPath = `/${event.filename}`;
                //     const module = await import(scriptPath + `?t=${Date.now()}`); // Cache-busting with a timestamp
                //     console.log(`Updated JavaScript module: ${scriptPath}`, module);
                //     // If the module exports a function or object, initialize or reapply it
                //     if (module.default && typeof module.default === "function") {
                //       module.default(); // Call the default export if it's a function
                //     }
                //   } catch (error) {
                //     console.error(`Error updating JavaScript file (${event.filename}):`, error);
                //   }
            }
        }
        else if (event.action === "reload") {
            console.log("receive relaod");
            window.location.reload();
        }
    };
    ws.onopen = () => {
        console.log("WebSocket connection established");
    };
    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
    ws.onclose = () => {
        console.log("WebSocket connection closed");
    };
}
async function activate() {
    try {
        const data = await loadRoutes();
        const { routes, styles, base, type } = data;
        if (routes)
            await loadJSFiles(routes, base);
        loadCSSFiles(styles);
        setEventListeners();
        Ura.refresh();
        console.log(data);
        console.log(Ura.Routes);
        if (!type)
            console.error("type error");
        if (type === "dev")
            sync();
    }
    catch (error) {
        console.error("Error loading resources:", error);
    }
}
async function setStyles(list) {
    list.forEach(elem => {
        handleCSSUpdate(elem);
    });
}
async function start() {
    setEventListeners();
    Ura.refresh();
    console.log(Ura.Routes);
    //@ts-ignore
    if (window.mode === "dev")
        sync();
}
// HTTP
async function HTTP_Request(method, url, headers = {}, body) {
    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", ...headers },
            body: body ? JSON.stringify(body) : undefined,
        });
        let responseData = null;
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json"))
            responseData = await response.json();
        else if (contentType && contentType.includes("text/"))
            responseData = await response.text();
        else if (contentType)
            responseData = await response.blob();
        return {
            data: responseData,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        };
    }
    catch (error) {
        throw error;
    }
}
// API
if (!localStorage.getItem('ura-store'))
    localStorage.setItem('ura-store', JSON.stringify({}));
function setGlobal(name, value) {
    let store = JSON.parse(localStorage.getItem('ura-store'));
    if (!deepEqual(store[name], value)) {
        store[name] = value;
        localStorage.setItem('ura-store', JSON.stringify(store));
    }
}
function getGlobal(name) {
    let store = JSON.parse(localStorage.getItem('ura-store')) || {};
    return store[name];
}
function rmGlobal(name) {
    let store = JSON.parse(localStorage.getItem('ura-store')) || {};
    if (store[name]) {
        delete store[name];
        localStorage.setItem('ura-store', JSON.stringify(store));
    }
}
function clearGlobal() {
    localStorage.setItem('ura-store', JSON.stringify({}));
}
const Ura = {
    store: {
        set: setGlobal,
        get: getGlobal,
        remove: rmGlobal,
        clear: clearGlobal
    },
    e,
    fr,
    setRoute,
    getRoute,
    display,
    sync,
    loadCSS,
    init,
    Routes,
    reconciliate,
    deepEqual,
    normalizePath,
    refresh,
    navigate,
    setRoutes,
    setStyles,
    // send: HTTP_Request,
    activate,
    start,
};
export default Ura;
