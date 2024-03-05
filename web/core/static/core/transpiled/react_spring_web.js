/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/@react-spring/web@9.6.1/dist/react-spring-web.esm.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import{Globals as e}from"@react-spring/core";
export*from"@react-spring/core";
import{unstable_batchedUpdates as t}from"react-dom";
import{createStringInterpolator as r,colors as o,eachProp as s,is as a,toArray as i,FluidValue as n,each as l,getFluidValue as p,hasFluidValue as d,addFluidObserver as c,removeFluidObserver as u,callFluidObservers as m}from"@react-spring/shared";
import{createHost as h,AnimatedObject as f}from"@react-spring/animated";
function g(e,t){if(null==e)return{};var r,o,s={},a=Object.keys(e);for(o=0;o<a.length;o++)r=a[o],t.indexOf(r)>=0||(s[r]=e[r]);return s}const b=["style","children","scrollTop","scrollLeft","viewBox"],y=/^--/;function x(e,t){return null==t||"boolean"==typeof t||""===t?"":"number"!=typeof t||0===t||y.test(e)||k.hasOwnProperty(e)&&k[e]?(""+t).trim():t+"px"}const v={};let k={animationIterationCount:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0};const w=["Webkit","Ms","Moz","O"];k=Object.keys(k).reduce(((e,t)=>(w.forEach((r=>e[((e,t)=>e+t.charAt(0).toUpperCase()+t.substring(1))(r,t)]=e[t])),e)),k);const O=["x","y","z"],C=/^(matrix|translate|scale|rotate|skew)/,A=/^(translate)/,S=/^(rotate|skew)/,j=(e,t)=>a.num(e)&&0!==e?e+t:e,$=(e,t)=>a.arr(e)?e.every((e=>$(e,t))):a.num(e)?e===t:parseFloat(e)===t;class z extends f{constructor(e){let{x:t,y:r,z:o}=e,n=g(e,O);const l=[],p=[];(t||r||o)&&(l.push([t||0,r||0,o||0]),p.push((e=>[`translate3d(${e.map((e=>j(e,"px"))).join(",")})`,$(e,0)]))),s(n,((e,t)=>{if("transform"===t)l.push([e||""]),p.push((e=>[e,""===e]));else if(C.test(t)){if(delete n[t],a.und(e))return;const r=A.test(t)?"px":S.test(t)?"deg":"";l.push(i(e)),p.push("rotate3d"===t?([e,t,o,s])=>[`rotate3d(${e},${t},${o},${j(s,r)})`,$(s,0)]:e=>[`${t}(${e.map((e=>j(e,r))).join(",")})`,$(e,t.startsWith("scale")?1:0)])}})),l.length&&(n.transform=new I(l,p)),super(n)}}class I extends n{constructor(e,t){super(),this._value=null,this.inputs=e,this.transforms=t}get(){return this._value||(this._value=this._get())}_get(){let e="",t=!0;return l(this.inputs,((r,o)=>{const s=p(r[0]),[i,n]=this.transforms[o](a.arr(s)?s:r.map(p));e+=" "+i,t=t&&n})),t?"none":e}observerAdded(e){1==e&&l(this.inputs,(e=>l(e,(e=>d(e)&&c(e,this)))))}observerRemoved(e){0==e&&l(this.inputs,(e=>l(e,(e=>d(e)&&u(e,this)))))}eventObserved(e){"change"==e.type&&(this._value=null),m(this,e)}}const P=["scrollTop","scrollLeft"];e.assign({batchedUpdates:t,createStringInterpolator:r,colors:o});const _=h(["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","main","map","mark","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr","circle","clipPath","defs","ellipse","foreignObject","g","image","line","linearGradient","mask","path","pattern","polygon","polyline","radialGradient","rect","stop","svg","text","tspan"],{applyAnimatedValues:function(e,t){if(!e.nodeType||!e.setAttribute)return!1;const r="filter"===e.nodeName||e.parentNode&&"filter"===e.parentNode.nodeName,o=t,{style:s,children:a,scrollTop:i,scrollLeft:n,viewBox:l}=o,p=g(o,b),d=Object.values(p),c=Object.keys(p).map((t=>r||e.hasAttribute(t)?t:v[t]||(v[t]=t.replace(/([A-Z])/g,(e=>"-"+e.toLowerCase())))));void 0!==a&&(e.textContent=a);for(let t in s)if(s.hasOwnProperty(t)){const r=x(t,s[t]);y.test(t)?e.style.setProperty(t,r):e.style[t]=r}c.forEach(((t,r)=>{e.setAttribute(t,d[r])})),void 0!==i&&(e.scrollTop=i),void 0!==n&&(e.scrollLeft=n),void 0!==l&&e.setAttribute("viewBox",l)},createAnimatedStyle:e=>new z(e),getComponentProps:e=>g(e,P)}).animated;export{_ as a,_ as animated};export default null;