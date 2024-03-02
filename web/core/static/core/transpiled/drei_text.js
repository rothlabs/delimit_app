/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/@react-three/drei@9.99.3/core/Text.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import e from"babel-helpers-extends";
import*as t from"react";
import{useThree as r}from"@react-three/fiber";
import{suspend as n}from"suspend-react";
const o=t.forwardRef((({sdfGlyphSize:o=64,anchorX:s="center",anchorY:m="middle",font:a,fontSize:c=1,children:i,characters:f,onSync:p,...h},l)=>{const{Text:d,preloadFont:u}=n((async()=>import("./troika_three_text.js")),[]),y=r((({invalidate:e})=>e)),[x]=t.useState((()=>new d)),[S,b]=t.useMemo((()=>{const e=[];let r="";return t.Children.forEach(i,(t=>{"string"==typeof t||"number"==typeof t?r+=t:e.push(t)})),[e,r]}),[i]);return n((()=>new Promise((e=>u({font:a,characters:f},e)))),["troika-text",a,f]),t.useLayoutEffect((()=>{x.sync((()=>{y(),p&&p(x)}))})),t.useEffect((()=>()=>x.dispose()),[x]),t.createElement("primitive",e({object:x,ref:l,font:a,text:b,anchorX:s,anchorY:m,fontSize:c,sdfGlyphSize:o},h),S)}));export{o as Text};export default null;