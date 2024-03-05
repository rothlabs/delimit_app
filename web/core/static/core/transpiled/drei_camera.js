/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/@react-three/drei@9.99.5/core/CameraControls.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import e from"babel-helpers-extends";
import{Box3 as t,MathUtils as r,Matrix4 as n,Quaternion as o,Raycaster as s,Sphere as a,Spherical as m,Vector2 as c,Vector3 as i,Vector4 as l}from"three";
import*as d from"react";
import{forwardRef as p,useMemo as v,useEffect as E}from"react";
import{extend as f,useThree as L,useFrame as u}from"@react-three/fiber";
import h from"camera-controls";
const b=p(((p,b)=>{v((()=>{const e={Box3:t,MathUtils:{clamp:r.clamp},Matrix4:n,Quaternion:o,Raycaster:s,Sphere:a,Spherical:m,Vector2:c,Vector3:i,Vector4:l};h.install({THREE:e}),f({CameraControlsImpl:h})}),[]);const{camera:g,domElement:x,makeDefault:k,onStart:w,onEnd:C,onChange:S,regress:V,...M}=p,R=L((e=>e.camera)),j=L((e=>e.gl)),y=L((e=>e.invalidate)),B=L((e=>e.events)),D=L((e=>e.setEvents)),H=L((e=>e.set)),I=L((e=>e.get)),Q=L((e=>e.performance)),T=g||R,U=x||B.connected||j.domElement,q=v((()=>new h(T)),[T]);return u(((e,t)=>{q.enabled&&q.update(t)}),-1),E((()=>(q.connect(U),()=>{q.disconnect()})),[U,q]),E((()=>{const e=e=>{y(),V&&Q.regress(),S&&S(e)},t=e=>{w&&w(e)},r=e=>{C&&C(e)};return q.addEventListener("update",e),q.addEventListener("controlstart",t),q.addEventListener("controlend",r),q.addEventListener("control",e),q.addEventListener("transitionstart",e),q.addEventListener("wake",e),()=>{q.removeEventListener("update",e),q.removeEventListener("controlstart",t),q.removeEventListener("controlend",r),q.removeEventListener("control",e),q.removeEventListener("transitionstart",e),q.removeEventListener("wake",e)}}),[q,w,C,y,D,V,S]),E((()=>{if(k){const e=I().controls;return H({controls:q}),()=>H({controls:e})}}),[k,q]),d.createElement("primitive",e({ref:b,object:q},M))}));export{b as CameraControls};export default null;
