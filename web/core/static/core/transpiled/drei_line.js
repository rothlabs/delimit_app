/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/@react-three/drei@9.99.3/core/Line.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import e from"babel-helpers-extends";
import*as t from"react";
import{Vector3 as n,Vector4 as r,Vector2 as o,Color as s}from"three";
import{useThree as i}from"@react-three/fiber";
import{LineSegments2 as a}from"LineSegments2";
import{Line2 as m}from"Line2";
import{LineMaterial as l}from"LineMaterial";
import{LineSegmentsGeometry as c}from"LineSegmentsGeometry";
import{LineGeometry as f}from"LineGeometry";

const p=t.forwardRef((function({points:p,color:u=16777215,vertexColors:d,linewidth:h,lineWidth:w,segments:y,dashed:E,...b},v){var x;const g=i((e=>e.size)),A=t.useMemo((()=>y?new a:new m),[y]),[S]=t.useState((()=>new l)),j=4===(null==d||null==(x=d[0])?void 0:x.length)?4:3,C=t.useMemo((()=>{const e=y?new c:new f,t=p.map((e=>{const t=Array.isArray(e);return e instanceof n||e instanceof r?[e.x,e.y,e.z]:e instanceof o?[e.x,e.y,0]:t&&3===e.length?[e[0],e[1],e[2]]:t&&2===e.length?[e[0],e[1],0]:e}));if(e.setPositions(t.flat()),d){u=16777215;const t=d.map((e=>e instanceof s?e.toArray():e));e.setColors(t.flat(),j)}return e}),[p,y,d,j]);return t.useLayoutEffect((()=>{A.computeLineDistances()}),[p,A]),t.useLayoutEffect((()=>{E?S.defines.USE_DASH="":delete S.defines.USE_DASH,S.needsUpdate=!0}),[E,S]),t.useEffect((()=>()=>C.dispose()),[C]),t.createElement("primitive",e({object:A,ref:v},b),t.createElement("primitive",{object:C,attach:"geometry"}),t.createElement("primitive",e({object:S,attach:"material",color:u,vertexColors:Boolean(d),resolution:[g.width,g.height],linewidth:null!=h?h:w,dashed:E,transparent:4===j},b)))}));export{p as Line};export default null;