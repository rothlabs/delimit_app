/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/@react-three/drei@9.99.3/core/Svg.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import e from"babel-helpers-extends";
import{useLoader as t}from"@react-three/fiber";
import*as r from"react";
import{forwardRef as s,useMemo as a,useEffect as l,Fragment as o}from"react";
import{DoubleSide as m}from"three";
import{SVGLoader as i}from"SVGLoader";

//function e(){return e=Object.assign?Object.assign.bind():function(e){for(var r=1;r<arguments.length;r++){var n=arguments[r];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},e.apply(this,arguments)};

const n=s((function({src:s,skipFill:n,skipStrokes:p,fillMaterial:c,strokeMaterial:u,fillMeshProps:h,strokeMeshProps:y,...f},d){const k=t(i,s.startsWith("<svg")?`data:image/svg+xml;utf8,${s}`:s),D=a((()=>p?[]:k.paths.map((e=>{var t;return void 0===(null==(t=e.userData)?void 0:t.style.stroke)||"none"===e.userData.style.stroke?null:e.subPaths.map((t=>i.pointsToStroke(t.getPoints(),e.userData.style)))}))),[k,p]);return l((()=>()=>D.forEach((e=>e&&e.map((e=>e.dispose()))))),[D]),r.createElement("object3D",e({ref:d},f),r.createElement("object3D",{scale:[1,-1,1]},k.paths.map(((t,s)=>{var a,l;return r.createElement(o,{key:s},!n&&void 0!==(null==(a=t.userData)?void 0:a.style.fill)&&"none"!==t.userData.style.fill&&i.createShapes(t).map(((s,a)=>r.createElement("mesh",e({key:a},h),r.createElement("shapeGeometry",{args:[s]}),r.createElement("meshBasicMaterial",e({color:t.userData.style.fill,opacity:t.userData.style.fillOpacity,transparent:!0,side:m,depthWrite:!1},c))))),!p&&void 0!==(null==(l=t.userData)?void 0:l.style.stroke)&&"none"!==t.userData.style.stroke&&t.subPaths.map(((a,l)=>r.createElement("mesh",e({key:l,geometry:D[s][l]},y),r.createElement("meshBasicMaterial",e({color:t.userData.style.stroke,opacity:t.userData.style.strokeOpacity,transparent:!0,side:m,depthWrite:!1},u))))))}))))}));export{n as Svg};export default null;