/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/@react-spring/three@9.6.1/dist/react-spring-three.esm.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import{addEffect as e,applyProps as r}from"@react-three/fiber";
import{Globals as t}from"@react-spring/core";
export*from"@react-spring/core";
import{createStringInterpolator as m,colors as a,raf as o}from"@react-spring/shared";
import{createHost as p}from"@react-spring/animated";
import*as s from"three";
const n=["primitive"].concat(Object.keys(s).filter((e=>/^[A-Z]/.test(e))).map((e=>e[0].toLowerCase()+e.slice(1))));t.assign({createStringInterpolator:m,colors:a,frameLoop:"always"}),e((()=>{o.advance()}));const i=p(n,{applyAnimatedValues:r}).animated;
export{i as a,i as animated};
export default null;
