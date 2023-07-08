
/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.17.1.
 * Original file: /npm/troika-three-utils@0.47.2/dist/troika-three-utils.esm.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import{ShaderLib as e,Matrix4 as t,Mesh as n,CylinderGeometry as i,Vector3 as r,Vector2 as a,ShaderChunk as o,MeshStandardMaterial as s,DoubleSide as c,UniformsUtils as l,MeshDepthMaterial as u,RGBADepthPacking as f,MeshDistanceMaterial as d}from"three";const h=/\bvoid\s+main\s*\(\s*\)\s*{/g;function m(e){return e.replace(/^[ \t]*#include +<([\w\d./]+)>/gm,(function(e,t){let n=o[t];return n?m(n):e}))}const p=[];for(let e=0;e<256;e++)p[e]=(e<16?"0":"")+e.toString(16);const v=Object.assign||function(){let e=arguments[0];for(let t=1,n=arguments.length;t<n;t++){let n=arguments[t];if(n)for(let t in n)Object.prototype.hasOwnProperty.call(n,t)&&(e[t]=n[t])}return e},g=Date.now(),M=new WeakMap,b=new Map;let _=1e10;function y(e,t){const n=function(e){const t=JSON.stringify(e,x);let n=$.get(t);null==n&&$.set(t,n=++D);return n}(t);let i=M.get(e);if(i||M.set(e,i=Object.create(null)),i[n])return new i[n];const r=`_onBeforeCompile${n}`,a=function(i,a){e.onBeforeCompile.call(this,i,a);const o=this.customProgramCacheKey()+"|"+i.vertexShader+"|"+i.fragmentShader;let s=b[o];if(!s){const e=function(e,{vertexShader:t,fragmentShader:n},i,r){let{vertexDefs:a,vertexMainIntro:o,vertexMainOutro:s,vertexTransform:c,fragmentDefs:l,fragmentMainIntro:u,fragmentMainOutro:f,fragmentColorTransform:d,customRewriter:h,timeUniform:p}=i;a=a||"",o=o||"",s=s||"",l=l||"",u=u||"",f=f||"",(c||h)&&(t=m(t));(d||h)&&(n=m(n=n.replace(/^[ \t]*#include <((?:tonemapping|encodings|fog|premultiplied_alpha|dithering)_fragment)>/gm,"\n//!BEGIN_POST_CHUNK $1\n$&\n//!END_POST_CHUNK\n")));if(h){let e=h({vertexShader:t,fragmentShader:n});t=e.vertexShader,n=e.fragmentShader}if(d){let e=[];n=n.replace(/^\/\/!BEGIN_POST_CHUNK[^]+?^\/\/!END_POST_CHUNK/gm,(t=>(e.push(t),""))),f=`${d}\n${e.join("\n")}\n${f}`}if(p){const e=`\nuniform float ${p};\n`;a=e+a,l=e+l}c&&(a=`${a}\nvoid troikaVertexTransform${r}(inout vec3 position, inout vec3 normal, inout vec2 uv) {\n  ${c}\n}\n`,o=`\ntroika_position_${r} = vec3(position);\ntroika_normal_${r} = vec3(normal);\ntroika_uv_${r} = vec2(uv);\ntroikaVertexTransform${r}(troika_position_${r}, troika_normal_${r}, troika_uv_${r});\n${o}\n`,t=(t=`vec3 troika_position_${r};\nvec3 troika_normal_${r};\nvec2 troika_uv_${r};\n${t}\n`).replace(/\b(position|normal|uv)\b/g,((e,t,n,i)=>/\battribute\s+vec[23]\s+$/.test(i.substr(0,n))?t:`troika_${t}_${r}`)),e.map&&e.map.channel>0||(t=t.replace(/\bMAP_UV\b/g,`troika_uv_${r}`)));return t=w(t,r,a,o,s),n=w(n,r,l,u,f),{vertexShader:t,fragmentShader:n}}(this,i,t,n);s=b[o]=e}i.vertexShader=s.vertexShader,i.fragmentShader=s.fragmentShader,v(i.uniforms,this.uniforms),t.timeUniform&&(i.uniforms[t.timeUniform]={get value(){return Date.now()-g}}),this[r]&&this[r](i)},o=function(){return s(t.chained?e:e.clone())},s=function(i){const r=Object.create(i,c);return Object.defineProperty(r,"baseMaterial",{value:e}),Object.defineProperty(r,"id",{value:_++}),r.uuid=function(){const e=4294967295*Math.random()|0,t=4294967295*Math.random()|0,n=4294967295*Math.random()|0,i=4294967295*Math.random()|0;return(p[255&e]+p[e>>8&255]+p[e>>16&255]+p[e>>24&255]+"-"+p[255&t]+p[t>>8&255]+"-"+p[t>>16&15|64]+p[t>>24&255]+"-"+p[63&n|128]+p[n>>8&255]+"-"+p[n>>16&255]+p[n>>24&255]+p[255&i]+p[i>>8&255]+p[i>>16&255]+p[i>>24&255]).toUpperCase()}(),r.uniforms=v({},i.uniforms,t.uniforms),r.defines=v({},i.defines,t.defines),r.defines[`TROIKA_DERIVED_MATERIAL_${n}`]="",r.extensions=v({},i.extensions,t.extensions),r._listeners=void 0,r},c={constructor:{value:o},isDerivedMaterial:{value:!0},customProgramCacheKey:{writable:!0,configurable:!0,value:function(){return e.customProgramCacheKey()+"|"+n}},onBeforeCompile:{get:()=>a,set(e){this[r]=e}},copy:{writable:!0,configurable:!0,value:function(t){return e.copy.call(this,t),e.isShaderMaterial||e.isDerivedMaterial||(v(this.extensions,t.extensions),v(this.defines,t.defines),v(this.uniforms,l.clone(t.uniforms))),this}},clone:{writable:!0,configurable:!0,value:function(){const t=new e.constructor;return s(t).copy(this)}},getDepthMaterial:{writable:!0,configurable:!0,value:function(){let n=this._depthMaterial;return n||(n=this._depthMaterial=y(e.isDerivedMaterial?e.getDepthMaterial():new u({depthPacking:f}),t),n.defines.IS_DEPTH_MATERIAL="",n.uniforms=this.uniforms),n}},getDistanceMaterial:{writable:!0,configurable:!0,value:function(){let n=this._distanceMaterial;return n||(n=this._distanceMaterial=y(e.isDerivedMaterial?e.getDistanceMaterial():new d,t),n.defines.IS_DISTANCE_MATERIAL="",n.uniforms=this.uniforms),n}},dispose:{writable:!0,configurable:!0,value(){const{_depthMaterial:t,_distanceMaterial:n}=this;t&&t.dispose(),n&&n.dispose(),e.dispose.call(this)}}};return i[n]=o,new o}function w(e,t,n,i,r){return(i||r||n)&&(e=e.replace(h,`\n${n}\nvoid troikaOrigMain${t}() {`),e+=`\nvoid main() {\n  ${i}\n  troikaOrigMain${t}();\n  ${r}\n}`),e}function x(e,t){return"uniforms"===e?void 0:"function"==typeof t?t.toString():t}let D=0;const $=new Map;const B={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function z(t){let n=B[t.type];return n?e[n]:t}function A(e){let t,n=/\buniform\s+(int|float|vec[234]|mat[34])\s+([A-Za-z_][\w]*)/g,i=Object.create(null);for(;null!==(t=n.exec(e));)i[t[2]]=t[1];return i}function S(e,n=new t){return"function"==typeof n.invert?n.copy(e).invert():n.getInverse(e),n}let T=null;const O=new s({color:16777215,side:c});class k extends n{static getGeometry(){return T||(T=new i(1,1,1,6,64).translate(0,.5,0))}constructor(){super(k.getGeometry(),O),this.pointA=new r,this.controlA=new r,this.controlB=new r,this.pointB=new r,this.radius=.01,this.dashArray=new a,this.dashOffset=0,this.frustumCulled=!1}get material(){let e=this._derivedMaterial;const t=this._baseMaterial||this._defaultMaterial||(this._defaultMaterial=O.clone());return e&&e.baseMaterial===t||(e=this._derivedMaterial=function(e){return y(e,{chained:!0,uniforms:{pointA:{value:new r},controlA:{value:new r},controlB:{value:new r},pointB:{value:new r},radius:{value:.01},dashing:{value:new r}},vertexDefs:"\nuniform vec3 pointA;\nuniform vec3 controlA;\nuniform vec3 controlB;\nuniform vec3 pointB;\nuniform float radius;\nvarying float bezierT;\n\nvec3 cubicBezier(vec3 p1, vec3 c1, vec3 c2, vec3 p2, float t) {\n  float t2 = 1.0 - t;\n  float b0 = t2 * t2 * t2;\n  float b1 = 3.0 * t * t2 * t2;\n  float b2 = 3.0 * t * t * t2;\n  float b3 = t * t * t;\n  return b0 * p1 + b1 * c1 + b2 * c2 + b3 * p2;\n}\n\nvec3 cubicBezierDerivative(vec3 p1, vec3 c1, vec3 c2, vec3 p2, float t) {\n  float t2 = 1.0 - t;\n  return -3.0 * p1 * t2 * t2 +\n    c1 * (3.0 * t2 * t2 - 6.0 * t2 * t) +\n    c2 * (6.0 * t2 * t - 3.0 * t * t) +\n    3.0 * p2 * t * t;\n}\n",vertexTransform:'\nfloat t = position.y;\nbezierT = t;\nvec3 bezierCenterPos = cubicBezier(pointA, controlA, controlB, pointB, t);\nvec3 bezierDir = normalize(cubicBezierDerivative(pointA, controlA, controlB, pointB, t));\n\n// Make "sideways" always perpendicular to the camera ray; this ensures that any twists\n// in the cylinder occur where you won\'t see them: \nvec3 viewDirection = normalMatrix * vec3(0.0, 0.0, 1.0);\nif (bezierDir == viewDirection) {\n  bezierDir = normalize(cubicBezierDerivative(pointA, controlA, controlB, pointB, t == 1.0 ? t - 0.0001 : t + 0.0001));\n}\nvec3 sideways = normalize(cross(bezierDir, viewDirection));\nvec3 upish = normalize(cross(sideways, bezierDir));\n\n// Build a matrix for transforming this disc in the cylinder:\nmat4 discTx;\ndiscTx[0].xyz = sideways * radius;\ndiscTx[1].xyz = bezierDir * radius;\ndiscTx[2].xyz = upish * radius;\ndiscTx[3].xyz = bezierCenterPos;\ndiscTx[3][3] = 1.0;\n\n// Apply transform, ignoring original y\nposition = (discTx * vec4(position.x, 0.0, position.z, 1.0)).xyz;\nnormal = normalize(mat3(discTx) * normal);\n',fragmentDefs:"\nuniform vec3 dashing;\nvarying float bezierT;\n",fragmentMainIntro:"\nif (dashing.x + dashing.y > 0.0) {\n  float dashFrac = mod(bezierT - dashing.z, dashing.x + dashing.y);\n  if (dashFrac > dashing.x) {\n    discard;\n  }\n}\n"})}(t),t.addEventListener("dispose",(function n(){t.removeEventListener("dispose",n),e.dispose()}))),e}set material(e){this._baseMaterial=e}get customDepthMaterial(){return this.material.getDepthMaterial()}get customDistanceMaterial(){return this.material.getDistanceMaterial()}onBeforeRender(){const{uniforms:e}=this.material,{pointA:t,controlA:n,controlB:i,pointB:r,radius:a,dashArray:o,dashOffset:s}=this;e.pointA.value.copy(t),e.controlA.value.copy(n),e.controlB.value.copy(i),e.pointB.value.copy(r),e.radius.value=a,e.dashing.value.set(o.x,o.y,s||0)}raycast(){}}export{k as BezierMesh,y as createDerivedMaterial,m as expandShaderIncludes,A as getShaderUniformTypes,z as getShadersForMaterial,S as invertMatrix4,h as voidMainRegExp};export default null;