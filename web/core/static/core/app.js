//import {ApolloClient, InMemoryCache, ApolloProvider, useQuery, useMutation, gql, createHttpLink} from '@apollo/client'; // apollo // gql  createHttpLink
import {ApolloClient, InMemoryCache, ApolloProvider, createHttpLink} from './apollo/ApolloClient.js';
import {setContext} from './apollo/ApolloContext.js';//'@apollo/client/link/context';//'aclc';
//import {createUploadLink} from 'auc';
import Cookie from "js-cookie";
import {createElement as r, StrictMode, useEffect, useState, useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';//'rdc';
import {createBrowserRouter, RouterProvider, Outlet} from 'react-router-dom';//'rrd';
import {Root} from './component/app/root.js';
import {Home} from './component/home/home.js';
import {Studio} from './component/studio/studio.js';
import {Router_Error, Query_Status} from './component/app/feedback.js';
import {Color, ColorManagement} from 'three'; 
import {useGLTF} from '@react-three/drei/useGLTF';//'drei';
import * as THREE from 'three';
import {extend} from '@react-three/fiber';
import {Text} from './troika/troika-three-text.js';



//import { DndProvider } from 'react-dnd';
//import { HTML5Backend } from 'react-dnd-html5-backend';

//////////import {create_base_slice} from './store/store.js';
//import {create_graph_slice} from './store/graph.js';
//import {create_pick_slice} from './store/pick.js';
//import {create_inspect_slice} from './store/inspect.js';
//import {create_design_slice} from './store/design.js';
//import {create_make_slice} from './store/make.js';
//import {create_reckon_slice} from './store/reckon.js'; 
//import {create_remake_slice} from './store/remake.js';
//import {create_drop_slice} from './store/drop.js';
//import {create_action_slice} from './store/action.js';
//import {create_cast_slice} from './store/cast.js';
//import {create_clear_slice} from './store/clear.js';
//import {create_part_slice} from './store/part/part.js';



extend({Text});

export const media_url = document.body.getAttribute('data-media-url');
export const static_url = document.body.getAttribute('data-static-url')+'core/';
//export const ctx = JSON.parse(document.getElementById('ctx').text); // to get info about landing page
//export const canvas = document.getElementById('buffer_canvas');

//export const base_font = static_url+'font/Inter-Medium.ttf';

ColorManagement.enabled = true;
// const style = getComputedStyle(document.body);
// export const theme = {
//     bg_body: style.getPropertyValue('--bs-body-bg'),

//     primary: style.getPropertyValue('--bs-primary'),//new Color(parseInt(style.getPropertyValue('--bs-primary').replace("#","0x"),16)),
//     primary_s: new Color(parseInt(style.getPropertyValue('--bs-primary').replace("#","0x"),16)).convertLinearToSRGB(),
//     primary_l: new Color(parseInt(style.getPropertyValue('--bs-primary').replace("#","0x"),16)).convertSRGBToLinear(),
//     secondary: style.getPropertyValue('--bs-secondary'), // new Color(parseInt(style.getPropertyValue('--bs-secondary').replace("#","0x"),16)),
//     secondary_s: new Color(parseInt(style.getPropertyValue('--bs-secondary').replace("#","0x"),16)).convertLinearToSRGB(),
//     secondary_l: new Color(parseInt(style.getPropertyValue('--bs-secondary').replace("#","0x"),16)).convertSRGBToLinear(),
//     success: new Color(parseInt(style.getPropertyValue('--bs-success').replace("#","0x"),16)), 
//     success_s: new Color(parseInt(style.getPropertyValue('--bs-success').replace("#","0x"),16)).convertLinearToSRGB(), 
//     success_l: new Color(parseInt(style.getPropertyValue('--bs-success').replace("#","0x"),16)).convertSRGBToLinear(), 
//     info: style.getPropertyValue('--bs-info'), // new Color(parseInt(style.getPropertyValue('--bs-info').replace("#","0x"),16)),
//     info_s: new Color(parseInt(style.getPropertyValue('--bs-info').replace("#","0x"),16)).convertLinearToSRGB(),
//     info_l: new Color(parseInt(style.getPropertyValue('--bs-info').replace("#","0x"),16)).convertSRGBToLinear(),
//     warning: style.getPropertyValue('--bs-warning'), // warning: new Color(parseInt(style.getPropertyValue('--bs-warning').replace("#","0x"),16)),
//     warning_s: new Color(parseInt(style.getPropertyValue('--bs-warning').replace("#","0x"),16)).convertLinearToSRGB(),
//     warning_l: new Color(parseInt(style.getPropertyValue('--bs-warning').replace("#","0x"),16)).convertSRGBToLinear(),
//     danger: style.getPropertyValue('--bs-danger'), // danger: new Color(parseInt(style.getPropertyValue('--bs-danger').replace("#","0x"),16)),
//     danger_s: new Color(parseInt(style.getPropertyValue('--bs-danger').replace("#","0x"),16)).convertLinearToSRGB(),
//     danger_l: new Color(parseInt(style.getPropertyValue('--bs-danger').replace("#","0x"),16)).convertSRGBToLinear(),
//     light: style.getPropertyValue('--bs-light'), // light: new Color(parseInt(style.getPropertyValue('--bs-light').replace("#","0x"),16)),
//     light_s: new Color(parseInt(style.getPropertyValue('--bs-light').replace("#","0x"),16)).convertLinearToSRGB(),
//     light_l: new Color(parseInt(style.getPropertyValue('--bs-light').replace("#","0x"),16)).convertSRGBToLinear(),
//     dark: style.getPropertyValue('--bs-dark'), // dark: new Color(parseInt(style.getPropertyValue('--bs-dark').replace("#","0x"),16)),
//     dark_s: new Color(parseInt(style.getPropertyValue('--bs-dark').replace("#","0x"),16)).convertLinearToSRGB(),
//     dark_l: new Color(parseInt(style.getPropertyValue('--bs-dark').replace("#","0x"),16)).convertSRGBToLinear(),
// };

export const make_id = (length=16)=> { // need to improve this so more random!!!!
    let s = '';
    Array.from({ length }).some(() => {
      s += Math.random().toString(36).slice(2); // always hear that Math.random is not good for id generation
      return s.length >= length;
    });
    return s;//return upper(t) + '/' + s.slice(0, length);
};
export const client_instance = make_id('Client');

const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const up = new THREE.Vector3(0,1,0);
const m1 = new THREE.Matrix4();




//export const random=(min, max)=> Math.random() * (max - min) + min;
// export function random_vector({min, max, x, y, z}){ // just use vector3.randomDirection !!!!!!!!!
//     const vect = new THREE.Vector3(random(-1,1),random(-1,1),random(-1,1)).normalize().multiplyScalar(random(min,max));
//     x!=undefined && vect.setX(x);
//     y!=undefined && vect.setY(y);
//     z!=undefined && vect.setZ(z);
//     return vect;
// }



export function use_media_glb(url){ // makes fresh copy of glb geom and such on each load so it actually changes
    const {nodes} = useGLTF(media_url+url);
    const [cloned_nodes, set_cloned_nodes] = useState([]);
    useEffect(() => {
        if(nodes){
            //console.log(nodes);
            var node_buffer = [];
            //nodes.AuxScene.children[0].children.forEach((group)=> {
            Object.entries(nodes).map((n,i)=>{n=n[1];
                //group.children.forEach((n)=> {
                //    if(n.name.includes){
                node_buffer.push(n.clone(true));
                if(n.geometry && n.geometry.attributes.position){
                    const geo = new THREE.BufferGeometry();
                    geo.setAttribute('position', new THREE.BufferAttribute( new Float32Array(n.geometry.attributes.position.array), 3 ));
                    node_buffer[node_buffer.length-1].geometry = geo;
                }
                    //}
                //});
            });
            set_cloned_nodes(node_buffer);
        }
    }, [nodes])
    return cloned_nodes;
}

export function readable(text){
    return text.toLowerCase().split('_').map(s=> s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
}
export function upper(text){
    return text.toLowerCase().split('_').map(s=> s.charAt(0).toUpperCase() + s.substring(1)).join('_');
}


//import {createUploadLink} from './apollo/upload.js';
const auth_link = setContext((_,{headers})=>{return{headers:{...headers,
    'x-csrftoken': Cookie.get('csrftoken'),
}}});
const termination_link = createHttpLink({
    uri: 'https://delimit.art/gql',
});
// const termination_link = createUploadLink({
//     uri: 'https://delimit.art/gql',
//     headers: {
//        'Apollo-Require-Preflight': 'true',
//     },
// });

export const gql_client = new ApolloClient({link:auth_link.concat(termination_link), cache:new InMemoryCache()});

createRoot(document.getElementById('app')).render(r(()=>
    //r(StrictMode,{},
    //r(DndProvider, {backend:HTML5Backend},
        r(ApolloProvider, {client: gql_client},
            r(RouterProvider, {router:createBrowserRouter([
                {path:'/', element:r(Root), errorElement:r(Router_Error), children:[
                    {path:'',        element:r(Home)},
                    {path:'shop',    element:r('p',{}, 'At Shop')},
                    {path:'studio',  element:r(Studio), errorElement:r(Router_Error)},  // {path:'studio',  element:r(Outlet), errorElement:r(Router_Error), children:[
                        //{path:'',       element:r(Studio_Browser)},
                        //{path:':id',    element:r(Studio_Editor)},
                    //]},
                ]},
            ])}),
        )
    //)
    //)
));
//import apolloUploadClient from 'https://cdn.jsdelivr.net/npm/apollo-upload-client/+esm';
//"auc":       "https://esm.sh/apollo-upload-client?pin=v106",
//export const client = new ApolloClient({link:auth_link.concat(http_link), cache:new InMemoryCache()});
//const http_link = createHttpLink({uri:'https://delimit.art/gql'});




//if(p.op=='remove' && p.path.length==2 && p.path[0]=='n') save_patches = true;
        //if(p.op=='add' && p.path.length==3 && p.path[2]=='deleted') save_patches = true;


            // var result = produceWithPatches(d, d=>{ 
            //     inverse[patch].forEach(p=>{
            //         if(p.op=='remove' && p.path.length==2 && p.path[0]=='n'){
            //             d.delete.node(d, p.path[1]);//dead_nodes.push(p.path[0]);
            //         }
            //     });
            //     //dead_nodes.forEach(n=> d.delete.node(d, n));
            // });
            // d.send(d, [...inverse[patch], ...result[1]]);





//const produce_stack = []; 
//var produce_number = 0;
//useS.subscribe(d=>{
    //if(produce_stack.length > 0){
//export const ss = func=> useS.setState(produce(d=>{func(d)}));//{ // need different store for instant user input
    //produce_number++;
    //produce_stack.push(()=>   useS.setState(produce(d=>{func(d);d.produce_number++;}))   );
//};

// export const ss = func=>{ 
//     //produce_number++;
//     //produce_stack.push(()=>{
//         set_state(func, true);
//     //});
// };
// // function check_stack(){
// //     //console.log(produce_stack.length, produce_number, gs().produce_number);
// //     if(produce_number == gs().produce_number){
// //         const produce_func = produce_stack.shift();
// //         if(produce_func){
// //             produce_func();
// //             produce_number++;
// //         }
// //     }
// //     setTimeout(check_stack,20);
// // }
// // check_stack();

//return result[0];//produce(d2, d2=>{ d2.final(d2,patches2) });
        //return produce(dd,dd=>{ dd.consume(dd,patches);dd.produce_number++; }); //;dd.produce_number++;
    //})

// export function child(source, name, func){ // use Array.find(test_func) see moz docs
//     //var response = undefined;
//     if(source){
//         const c = source.children.find(c=> c.name.slice(0,name.length)==name)
//         if(c) return func(c);
//         //source.children.forEach(child => {
//         //    if(child.name.slice(0,name.length) == name) response = func(child);
//         //});
//     }
//     //return response;
// }

// export function use_effect(deps, func){
//     useEffect(()=> {
//         //console.log(deps);
//         if(!deps.includes(undefined) && !deps.includes(null) && !deps.includes([])) func(); // only run func if all dependencies contain a value
//     }, deps); 
// }