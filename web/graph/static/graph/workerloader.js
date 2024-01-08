const importMap = {
    "imports": {
        "three":"https://cdn.jsdelivr.net/npm/three/+esm",
    }
}

postMessage("loaded loader");
importScripts('https://ga.jspm.io/npm:es-module-shims@1.6.2/dist/es-module-shims.wasm.js');
importShim.addImportMap(importMap);
importShim('/static/graph/worker.js').then((res) => {
    console.log("module has been loaded");
}).catch(e => setTimeout(() => { throw e; }));






