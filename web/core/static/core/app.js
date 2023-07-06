import {ApolloClient, InMemoryCache, ApolloProvider, useQuery, useMutation, gql} from '@apollo/client'; // apollo // gql  createHttpLink
import {setContext} from '@apollo/client/link/context';//'aclc';
//import {createUploadLink} from 'auc';
import Cookie from "js-cookie";
import {createElement as r, StrictMode, useEffect, useState, useRef, forwardRef, useImperativeHandle, useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';//'rdc';
import {createBrowserRouter, RouterProvider, Outlet} from 'react-router-dom';//'rrd';
import {Root} from './component/app/root.js';
import {Studio} from './component/studio/studio.js';
import {Router_Error, Query_Status} from './component/app/feedback.js';
import {Color, ColorManagement} from 'three'; 
import {useGLTF} from '@react-three/drei/useGLTF';//'drei';
import * as THREE from 'three';
import {useFrame, useThree} from '@react-three/fiber';//'r3f';

import {produce, applyPatches, produceWithPatches, enablePatches} from 'immer'; enablePatches();
import {create} from 'zustand';
import {subscribeWithSelector} from 'zustand/middleware';//'zmiddle';
import {shallow} from 'zustand/shallow';//'shallow';
import {create_base_slice} from './store/base.js';
import {create_graph_slice} from './store/graph.js';
import {create_pick_slice} from './store/pick.js';
import {create_inspect_slice} from './store/inspect.js';
import {create_design_slice} from './store/design.js';
import {create_make_slice} from './store/make.js';
import {create_node_slice} from './store/node.js';
import {create_reckon_slice} from './store/reckon/reckon.js'; 
import {create_remake_slice} from './store/remake.js';
import {create_delete_slice} from './store/delete.js';
import {create_action_slice} from './store/action.js';
import {create_cast_slice} from './store/cast.js';
import {create_clear_slice} from './store/clear.js';

export const media_url = document.body.getAttribute('data-media-url');
export const static_url = document.body.getAttribute('data-static-url')+'core/';
export const ctx = JSON.parse(document.getElementById('ctx').text); // to get info about landing page

ColorManagement.enabled = true;
const style = getComputedStyle(document.body);
export const theme = {
    primary: new Color(parseInt(style.getPropertyValue('--bs-primary').replace("#","0x"),16)),
    primary_s: new Color(parseInt(style.getPropertyValue('--bs-primary').replace("#","0x"),16)).convertLinearToSRGB(),
    primary_l: new Color(parseInt(style.getPropertyValue('--bs-primary').replace("#","0x"),16)).convertSRGBToLinear(),
    secondary: new Color(parseInt(style.getPropertyValue('--bs-secondary').replace("#","0x"),16)),
    secondary_s: new Color(parseInt(style.getPropertyValue('--bs-secondary').replace("#","0x"),16)).convertLinearToSRGB(),
    secondary_l: new Color(parseInt(style.getPropertyValue('--bs-secondary').replace("#","0x"),16)).convertSRGBToLinear(),
    success: new Color(parseInt(style.getPropertyValue('--bs-success').replace("#","0x"),16)), 
    success_s: new Color(parseInt(style.getPropertyValue('--bs-success').replace("#","0x"),16)).convertLinearToSRGB(), 
    success_l: new Color(parseInt(style.getPropertyValue('--bs-success').replace("#","0x"),16)).convertSRGBToLinear(), 
    info: new Color(parseInt(style.getPropertyValue('--bs-info').replace("#","0x"),16)),
    info_s: new Color(parseInt(style.getPropertyValue('--bs-info').replace("#","0x"),16)).convertLinearToSRGB(),
    info_l: new Color(parseInt(style.getPropertyValue('--bs-info').replace("#","0x"),16)).convertSRGBToLinear(),
    warning: new Color(parseInt(style.getPropertyValue('--bs-warning').replace("#","0x"),16)),
    warning_s: new Color(parseInt(style.getPropertyValue('--bs-warning').replace("#","0x"),16)).convertLinearToSRGB(),
    warning_l: new Color(parseInt(style.getPropertyValue('--bs-warning').replace("#","0x"),16)).convertSRGBToLinear(),
    danger: new Color(parseInt(style.getPropertyValue('--bs-danger').replace("#","0x"),16)),
    danger_s: new Color(parseInt(style.getPropertyValue('--bs-danger').replace("#","0x"),16)).convertLinearToSRGB(),
    danger_l: new Color(parseInt(style.getPropertyValue('--bs-danger').replace("#","0x"),16)).convertSRGBToLinear(),
    light: new Color(parseInt(style.getPropertyValue('--bs-light').replace("#","0x"),16)),
    light_s: new Color(parseInt(style.getPropertyValue('--bs-light').replace("#","0x"),16)).convertLinearToSRGB(),
    light_l: new Color(parseInt(style.getPropertyValue('--bs-light').replace("#","0x"),16)).convertSRGBToLinear(),
    dark: new Color(parseInt(style.getPropertyValue('--bs-dark').replace("#","0x"),16)),
    dark_s: new Color(parseInt(style.getPropertyValue('--bs-dark').replace("#","0x"),16)).convertLinearToSRGB(),
    dark_l: new Color(parseInt(style.getPropertyValue('--bs-dark').replace("#","0x"),16)).convertSRGBToLinear(),
};

export const make_id = (length=16)=> { // need to improve this so more random!!!!
    let s = '';
    Array.from({ length }).some(() => {
      s += Math.random().toString(36).slice(2); // always hear that Math.random is not good for id generation
      return s.length >= length;
    });
    return s.slice(0, length);
};
export const instance = make_id();

export const useS = create(
    subscribeWithSelector((...a) => ({ 
        ...create_base_slice(...a),
        ...create_graph_slice(...a),
        ...create_pick_slice(...a),
        ...create_inspect_slice(...a),
        ...create_design_slice(...a),
        ...create_make_slice(...a),
        ...create_node_slice(...a),
        ...create_reckon_slice(...a),
        ...create_remake_slice(...a),
        ...create_delete_slice(...a),
        ...create_action_slice(...a),
        ...create_cast_slice(...a),
        ...create_clear_slice(...a),
    }))
);
useS.setState(d=>{  d.init(d); return d;  });
export const gs = ()=> useS.getState();
export const useSS = selector=> useS(selector, shallow);
export const useSub  = (selector, callback, triggers=[])=> useEffect(()=>useS.subscribe(selector, callback, {fireImmediately:true}), triggers);
export const useSubS = (selector, callback)=> useEffect(()=>useS.subscribe(selector, callback, {fireImmediately:true,equalityFn:shallow}),[]);
//export const subS  = (selector, callback)=> useS.subscribe(selector, callback, {fireImmediately:true});
//export const subSS = (selector, callback)=> useS.subscribe(selector, callback, {fireImmediately:true, equalityFn:shallow});
//export const subSSI = (selector, callback)=> useS.subscribe(selector, callback, {equalityFn:shallow,fireImmediately:true,});

var patch = 0;
var patches = [];
var inverse = [];
var fork = null; // for dragging and stuff like that 

function next_state(state, func){
    var all_patches = [];
    var all_inverse = [];
    var result = produceWithPatches(state, d=>{ func(d) }); //[d, patches, inverse_patches] d.next_funcs=[]; d.next_ids=[]; 
    while(result[1].length > 0){
        all_patches = [...all_patches, ...result[1]];
        all_inverse = [...result[2], ...all_inverse];
        result = produceWithPatches(result[0], d=>{ d.continue(d) }); 
    }
    useS.setState(result[0]); 
    return {state:result[0], patches:all_patches, inverse:all_inverse}; // rename state to d
}

function ignore_patch(p){
    const path = p.path.join('.');
    if(path == 'studio.panel') return false;
    if(path == 'studio.panel.show') return false;
    if(path == 'studio.panel.name') return false;
    if(path == 'design.matrix') return false;
    if(path == 'design.moving') return false;
    //if(path == 'design.n') return false;
    //if(path == 'design.group') return false;
    if(path == 'graph.c_c') return false;
    //if(p.path.includes('pick')) return false;
    return true;
}
const ignored_node_props = ['pick', 'graph', 'pin', 'c', 'c_c'];
function commit_state(arg){
    arg.patches = arg.patches.filter(p=> ignore_patch(p));
    arg.inverse = arg.inverse.filter(p=> ignore_patch(p));
    var save_patches = false;
    //console.log(patches);
    arg.patches.forEach(p=>{
        if(p.path[0]=='n'){
            if(p.path.length > 2){
                if(!ignored_node_props.includes(p.path[2])) save_patches = true;
            }else{
                save_patches = true;
            }
        }
    });
    // arg.patches.forEach(p=>{
    //     if(p.op=='replace' && p.path.length==3 && p.path[2]=='deleted') save_patches = true;
    // });
    // arg.patches.forEach(p=>{
    //     const path = p.path.join('.');
    //     if(p.path.includes('pick')) save_patches = false;
    //     if(path == 'design.mode') save_patches = false;
    //     if(path == 'studio.mode') save_patches = false;
    // });
    // arg.patches.forEach(p=>{
    //     if(p.op=='replace' && p.path.length==3 && p.path[2]=='deleted') save_patches = true;
    // });
    if(save_patches){
        //console.log('Commit Patches');
        arg.state.send(arg.state, arg.patches); // only send if saving patches for undo ?!?!?!
        //console.log(arg.patches);
        if(patches.length > patch){
            patches.splice(patch, patches.length-patch);
            inverse.splice(patch, inverse.length-patch);
        }
        const patches_extras = [];
        const new_patches = arg.patches.map(p=>{ // replace add with deleted=false
            var result = p;
            if(p.op=='add' && p.path.length==2 && p.path[0]=='n'){//console.log('replace add with replace n.id.deleted=false');
                result = {
                    op:'replace',
                    path: [...p.path, 'deleted'],
                    value:false,
                };
                patches_extras.push({
                    op:'replace',
                    path: [...p.path, 'open'],
                    value:true,
                });
            }
            return result;
        });
        const inverse_extras = [];
        const new_inverse = arg.inverse.map(p=>{ // replace remove with deleted=true
            var result = p;
            if(p.op=='remove' && p.path.length==2 && p.path[0]=='n'){//console.log('replace remove with replace n.id.deleted=true');
                result = {
                    op:'replace',
                    path: [...p.path, 'deleted'],
                    value:true,
                };
                inverse_extras.push({
                    op:'replace',
                    path: [...p.path, 'open'],
                    value:false,
                });
            }
            return result;
        });
        patches.push([...new_patches, ...patches_extras]);
        inverse.push([...new_inverse, ...inverse_extras]);
        if(patches.length > 10){
            patches = patches.slice(patches.length-10);
            inverse = inverse.slice(inverse.length-10);
        }
        patch = patches.length;
    }
}
export const rs = func=> {
    //console.log('recieve state');
    const result = next_state(gs(), func); 
    if(fork) fork = applyPatches(fork, result.patches);
} // recieve state
export const ss = func=> {
    //console.log('set state');
    //console.trace();
    commit_state(next_state(gs(), func)); 
}// rename to commit state?
export const fs = func=>{ 
    //console.log('fork state');
    fork=next_state(gs(), func).state;
}; // fork state
export const sf = func=>{
    //console.log('set fork');
    next_state(fork, func);
}; // set fork
export const mf = func=>{ // watch out for no-change resulting in undefined d!?!?!
    commit_state(next_state(fork, func));
    fork = null;
}; // merge fork

export function undo(){ 
    if(patch > 0){
        patch--;
        //console.log('Undo');
        //console.log(inverse[patch]);
        useS.setState(d=>{
            var d = applyPatches(d, inverse[patch]);
            d.send(d, inverse[patch]);
            d = produce(d, d=>{
                //d.pick.update(d);
                d.design.update(d);
                d.inspect.update(d);
                d.graph.update(d);
            });
            return d;
        });
    }
}
export function redo(){ 
    if(patch < patches.length){
        //console.log('Redo');
        //console.log(patches[patch]);
        useS.setState(d=>{
            var d = applyPatches(d, patches[patch]);
            d.send(d, patches[patch]);
            d = produce(d, d=>{
                //d.pick.update(d);
                d.design.update(d);
                d.inspect.update(d);
                d.graph.update(d);
            });
            return d;
        });
        patch++;
    }
}


export function use_window_size() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
        function updateSize() {
        setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return {width:size[0], height:size[1]};
}

export const random=(min, max)=> Math.random() * (max - min) + min;
export function random_vector({min, max, x, y, z}){
    const vect = new THREE.Vector3(random(-1,1),random(-1,1),random(-1,1)).normalize().multiplyScalar(random(min,max));
    x!=undefined && vect.setX(x);
    y!=undefined && vect.setY(y);
    z!=undefined && vect.setZ(z);
    return vect;
}



function compile_gql(name, gql_parts){
    const header_vars = [];
    var header = '';
    var body = '';
    var variables = {};
    gql_parts.forEach(q => {
        const q_words = q[0].split(' ');
        body += q_words[0];
        if(q.length>1) body += '(';
        for(var i=1; i<q.length; i++){ 
            const q_var_meta = q[i][0].split(' ');
            if(!header_vars.includes(q_var_meta[1])) header += ', $' + q_var_meta[1] + ': ' + q_var_meta[0];
            body += q_var_meta[1] + ': $' + q_var_meta[1];
            if(i<q.length-1){
                body += ', ';
            }else{ body += ')'; }
            variables[q_var_meta[1]] = q[i][1]
            header_vars.push(q_var_meta[1]);
        }
        body += '{'+q[0].slice(q_words[0].length+1)+'} '; 
    });
    if(header.length>0) header = '(' + header.slice(2) + ')';
    header = name + header;
    return {header, body, variables}
}
function gql_status(loading, error, data, done){
    var result = null;// {message: 'Idle'};
	if (loading) result=()=> r(Query_Status, {message: 'Working...'});
    if (error)   result=()=> r(Query_Status, {message: error.message});
    if (data)    result=()=> r(Query_Status, {message: done()}); 
    return result;
}
export function use_query(name, gql_parts, arg){ // 'cache-and-network'
    //console.log(fetchPolicy);
    const {header, body, variables} = compile_gql(name, gql_parts);
    //console.log({header, body, variables});
    const {loading, error, data, startPolling} = useQuery(
        gql`query ${header}{${body}}`, {   
        variables:    variables, 
        fetchPolicy:  arg && arg.fetchPolicy, 
        onCompleted:  arg && arg.onCompleted,
        pollInterval: arg && arg.pollInterval,
        notifyOnNetworkStatusChange: arg && arg.notifyOnNetworkStatusChange,
    }); 

    //if(reactive_var) reactive_var(data);
    //var alt = null;
	//if(loading) alt =()=> r(Query_Status, {message: 'Working...'});
    //if(error)   alt =()=> r(Query_Status, {message: 'Query Error: ' + error.message});
    return {data:data, status:gql_status(loading,error,data,()=>'Done'), startPolling:startPolling};
}
export function use_mutation(name, gql_parts, arg){
    const {header, body, variables} = compile_gql(name, gql_parts);
    //console.log({header, body, variables});
    const [mutate, {data, loading, error, reset}] = useMutation( 
        gql`mutation ${header}{${body}}`, {
        variables:variables, 
        refetchQueries: arg && arg.refetch && arg.refetch.split(' '),
        onCompleted: arg && arg.onCompleted,
    } ); // Add option for cache
    const done=()=> data[gql_parts[0][0].split(' ')[0]].reply;
    return {mutate:mutate, data:data, status:gql_status(loading,error,data,done), reset:reset};
}

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

export const Fixed_Size_Group = forwardRef(function Fixed_Size_Group({size, props, children}, obj){
    //const obj = useRef();
    const {camera} = useThree();
    //useImperativeHandle(ref,()=>({ 
    //    obj:obj.current,
    //}));
    useFrame(() => {
        var factor = size / camera.zoom;
        if(obj) obj.current.scale.set(factor,factor,factor);
    });
    return(
        r('group', {ref: obj, ...props, children:children})
    )
});

export function Spinner({children}){
    const obj = useRef();
    const [dir, set_dir] = useState(random_vector({min:0.5, max:0.5}));
    useFrame((state, delta) => {
        obj.current.rotateX(delta * dir.x);//obj.current.rotation.x += delta * dir.x;
        obj.current.rotateY(delta * dir.y);//obj.current.rotation.y += delta * dir.y;
        obj.current.rotateZ(delta * dir.z);//obj.current.rotation.z += delta * dir.z;
    });
    return r('group', {ref:obj, children:children});
}

export function readable(text){
    return text.toLowerCase().split('_').map(s=> s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
}


import {createUploadLink} from './apollo/upload.js';
const auth_link = setContext((_,{headers})=>{return{headers:{...headers,
    'x-csrftoken': Cookie.get('csrftoken'),
}}});
const termination_link = createUploadLink({
    uri: 'https://delimit.art/gql',
    headers: {
       'Apollo-Require-Preflight': 'true',
    },
});

createRoot(document.getElementById('app')).render(r(()=>r(StrictMode,{},
    r(ApolloProvider,{client:new ApolloClient({link:auth_link.concat(termination_link), cache:new InMemoryCache()})},
        r(RouterProvider, {router:createBrowserRouter([
            {path:'/', element:r(Root), errorElement:r(Router_Error), children:[
                {path:'',        element:r('p',{}, 'At Home')},
                {path:'catalog', element:r('p',{}, 'At Catalog')},
                {path:'studio',  element:r(Studio), errorElement:r(Router_Error)},  // {path:'studio',  element:r(Outlet), errorElement:r(Router_Error), children:[
                    //{path:'',       element:r(Studio_Browser)},
                    //{path:':id',    element:r(Studio_Editor)},
                //]},
            ]},
        ])}),
    )
)));
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