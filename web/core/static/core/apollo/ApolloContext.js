/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.17.1.
 * Original file: /npm/@apollo/client@3.7.15/link/context/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import{__assign as e,__spreadArray as n,__extends as t,__rest as r}from"https://cdn.jsdelivr.net/npm/tslib@2.6.0/+esm";import{invariant as o,InvariantError as i}from"https://cdn.jsdelivr.net/npm/ts-invariant@0.10.3/+esm";import{remove as u}from"https://cdn.jsdelivr.net/npm/ts-invariant@0.10.3/process/index.js/+esm";import{Source as c,Kind as s,visit as f}from"https://cdn.jsdelivr.net/npm/graphql@16.6.0/+esm";import{Observable as a}from"https://cdn.jsdelivr.net/npm/zen-observable-ts@1.2.5/+esm";import"https://cdn.jsdelivr.net/npm/symbol-observable@4.0.0/+esm";var l="undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{};function p(e){try{return e()}catch(e){}}var v=p((function(){return globalThis}))||p((function(){return window}))||p((function(){return self}))||p((function(){return l}))||p((function(){return p.constructor("return this")()})),m="__",b=[m,m].join("DEV");var d=function(){try{return Boolean(__DEV__)}catch(e){return Object.defineProperty(v,b,{value:"production"!==p((function(){return"production"})),enumerable:!1,configurable:!0,writable:!0}),v[b]}}();u(),__DEV__?o("boolean"==typeof d,d):o("boolean"==typeof d,39);var h=["connection","include","skip","client","rest","export"];Object.assign((function(e,n,t){if(n&&t&&t.connection&&t.connection.key){if(t.connection.filter&&t.connection.filter.length>0){var r=t.connection.filter?t.connection.filter:[];r.sort();var o={};return r.forEach((function(e){o[e]=n[e]})),"".concat(t.connection.key,"(").concat(y(o),")")}return t.connection.key}var i=e;if(n){var u=y(n);i+="(".concat(u,")")}return t&&Object.keys(t).forEach((function(e){-1===h.indexOf(e)&&(t[e]&&Object.keys(t[e]).length?i+="@".concat(e,"(").concat(y(t[e]),")"):i+="@".concat(e))})),i}),{setStringify:function(e){var n=y;return y=e,n}});var y=function(e){return JSON.stringify(e,w)};function w(e,n){var t;return null===(t=n)||"object"!=typeof t||Array.isArray(n)||(n=Object.keys(n).sort().reduce((function(e,t){return e[t]=n[t],e}),{})),n}function x(e){return"Field"===e.kind}var _={kind:s.FIELD,name:{kind:s.NAME,value:"__typename"}};Object.assign((function(t){return f(t,{SelectionSet:{enter:function(t,r,o){if(!o||o.kind!==s.OPERATION_DEFINITION){var i=t.selections;if(i)if(!i.some((function(e){return x(e)&&("__typename"===e.name.value||0===e.name.value.lastIndexOf("__",0))}))){var u=o;if(!(x(u)&&u.directives&&u.directives.some((function(e){return"export"===e.name.value}))))return e(e({},t),{selections:n(n([],i,!0),[_],!1)})}}}}})}),{added:function(e){return e===_}});var g=a.prototype,O="@@observable";function E(e,n,t){var r=[];e.forEach((function(e){return e[n]&&r.push(e)})),r.forEach((function(e){return e[n](t)}))}g[O]||(g[O]=function(){return this}),"function"==typeof WeakMap&&p((function(){return navigator.product}));var q="function"==typeof Symbol&&"function"==typeof Symbol.for;function j(e){return e&&"function"==typeof e.then}function k(e,n){return n?n(e):a.of()}function N(e){return"function"==typeof e?new L(e):e}function S(e){return e.request.length<=1}p((function(){return window.document.createElement})),p((function(){return navigator.userAgent.indexOf("jsdom")>=0})),function(e){function n(n){Object.defineProperty(e,n,{value:a})}q&&Symbol.species&&n(Symbol.species),n("@@species")}(function(e){function n(n){var t=e.call(this,(function(e){return t.addObserver(e),function(){return t.removeObserver(e)}}))||this;return t.observers=new Set,t.promise=new Promise((function(e,n){t.resolve=e,t.reject=n})),t.handlers={next:function(e){null!==t.sub&&(t.latest=["next",e],t.notify("next",e),E(t.observers,"next",e))},error:function(e){var n=t.sub;null!==n&&(n&&setTimeout((function(){return n.unsubscribe()})),t.sub=null,t.latest=["error",e],t.reject(e),t.notify("error",e),E(t.observers,"error",e))},complete:function(){var e=t,n=e.sub,r=e.sources;if(null!==n){var o=(void 0===r?[]:r).shift();o?j(o)?o.then((function(e){return t.sub=e.subscribe(t.handlers)})):t.sub=o.subscribe(t.handlers):(n&&setTimeout((function(){return n.unsubscribe()})),t.sub=null,t.latest&&"next"===t.latest[0]?t.resolve(t.latest[1]):t.resolve(),t.notify("complete"),E(t.observers,"complete"))}}},t.nextResultListeners=new Set,t.cancel=function(e){t.reject(e),t.sources=[],t.handlers.complete()},t.promise.catch((function(e){})),"function"==typeof n&&(n=[new a(n)]),j(n)?n.then((function(e){return t.start(e)}),t.handlers.error):t.start(n),t}return t(n,e),n.prototype.start=function(e){void 0===this.sub&&(this.sources=Array.from(e),this.handlers.complete())},n.prototype.deliverLastMessage=function(e){if(this.latest){var n=this.latest[0],t=e[n];t&&t.call(e,this.latest[1]),null===this.sub&&"next"===n&&e.complete&&e.complete()}},n.prototype.addObserver=function(e){this.observers.has(e)||(this.deliverLastMessage(e),this.observers.add(e))},n.prototype.removeObserver=function(e){this.observers.delete(e)&&this.observers.size<1&&this.handlers.complete()},n.prototype.notify=function(e,n){var t=this.nextResultListeners;t.size&&(this.nextResultListeners=new Set,t.forEach((function(t){return t(e,n)})))},n.prototype.beforeNext=function(e){var n=!1;this.nextResultListeners.add((function(t,r){n||(n=!0,e(t,r))}))},n}(a));var D=function(e){function n(n,t){var r=e.call(this,n)||this;return r.link=t,r}return t(n,e),n}(Error),L=function(){function n(e){e&&(this.request=e)}return n.empty=function(){return new n((function(){return a.of()}))},n.from=function(e){return 0===e.length?n.empty():e.map(N).reduce((function(e,n){return e.concat(n)}))},n.split=function(e,t,r){var o=N(t),i=N(r||new n(k));return S(o)&&S(i)?new n((function(n){return e(n)?o.request(n)||a.of():i.request(n)||a.of()})):new n((function(n,t){return e(n)?o.request(n,t)||a.of():i.request(n,t)||a.of()}))},n.execute=function(n,t){return n.request(function(n,t){var r=e({},n);return Object.defineProperty(t,"setContext",{enumerable:!1,value:function(n){r=e(e({},r),"function"==typeof n?n(r):n)}}),Object.defineProperty(t,"getContext",{enumerable:!1,value:function(){return e({},r)}}),t}(t.context,function(e){var n={variables:e.variables||{},extensions:e.extensions||{},operationName:e.operationName,query:e.query};return n.operationName||(n.operationName="string"!=typeof n.query?n.query.definitions.filter((function(e){return"OperationDefinition"===e.kind&&!!e.name})).map((function(e){return e.name.value}))[0]||void 0:""),n}(function(e){for(var n=["query","operationName","variables","extensions","context"],t=0,r=Object.keys(e);t<r.length;t++){var o=r[t];if(n.indexOf(o)<0)throw __DEV__?new i("illegal argument: ".concat(o)):new i(27)}return e}(t))))||a.of()},n.concat=function(e,t){var r=N(e);if(S(r))return __DEV__&&o.warn(new D("You are calling concat on a terminating link, which will have no effect",r)),r;var i=N(t);return S(i)?new n((function(e){return r.request(e,(function(e){return i.request(e)||a.of()}))||a.of()})):new n((function(e,n){return r.request(e,(function(e){return i.request(e,n)||a.of()}))||a.of()}))},n.prototype.split=function(e,t,r){return this.concat(n.split(e,t,r||new n(k)))},n.prototype.concat=function(e){return n.concat(this,e)},n.prototype.request=function(e,n){throw __DEV__?new i("request is not implemented"):new i(22)},n.prototype.onError=function(e,n){if(n&&n.error)return n.error(e),!1;throw e},n.prototype.setOnError=function(e){return this.onError=e,this},n}();function P(e){return new L((function(n,t){var o=r(n,[]);return new a((function(r){var i,u=!1;return Promise.resolve(o).then((function(t){return e(t,n.getContext())})).then(n.setContext).then((function(){u||(i=t(n).subscribe({next:r.next.bind(r),error:r.error.bind(r),complete:r.complete.bind(r)}))})).catch(r.error.bind(r)),function(){u=!0,i&&i.unsubscribe()}}))}))}L.empty,L.from,L.split,L.concat,L.execute;export{P as setContext};export default null;
//## sourceMappingURL=/sm/13ac2659b8e8cfbf3fa2021037934756f27c7bd7749133173173d8e8d948ad38.map