import {ApolloClient, InMemoryCache, ApolloProvider, useQuery, useMutation, gql} from 'apollo'; // gql  createHttpLink
import {setContext} from 'aclc';
//import {createUploadLink} from 'auc';
import Cookie from "cookie";
import {createElement as r, StrictMode, useEffect, useState, useRef, forwardRef, useImperativeHandle, useLayoutEffect} from 'react';
import {createRoot} from 'rdc';
import {createBrowserRouter, RouterProvider, Outlet} from 'rrd';
import {Root} from './root.js';
import {Studio} from './studio/studio.js';
import {Router_Error, Query_Status} from './feedback.js';
import {Color, ColorManagement} from 'three'; 
//import set from 'lodash';
import {useGLTF} from 'drei';
import * as THREE from 'three';
import {useFrame, useThree} from 'r3f';

import {enablePatches} from 'immer';
enablePatches();

import {create} from 'zustand';
import {subscribeWithSelector} from 'zmiddle';
import {shallow} from 'shallow';
import {create_base_slice} from './state/base.js';
import {create_graph_slice} from './state/graph.js';
export const useD = create(
    subscribeWithSelector((...a) => ({ 
        ...create_base_slice(...a),
        ...create_graph_slice(...a),
    }))
);
export const useDS = (selector)=> useD(selector, shallow);
export const subD  = (selector, callback)=> useD.subscribe(selector, callback, {fireImmediately:true});
export const subDS = (selector, callback)=> useD.subscribe(selector, callback, {fireImmediately:true,equalityFn:shallow});

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
export function random_vector({min, max, x, y ,z}){
    const vect = new THREE.Vector3(x?0:random(-1,1),y?0:random(-1,1),z?0:random(-1,1)).normalize().multiplyScalar(random(min,max));
    x && vect.setX(x);
    y && vect.setY(y);
    z && vect.setZ(z);
    return vect;
}

export const media_url = document.body.getAttribute('data-media-url');
export const static_url = document.body.getAttribute('data-static-url')+'core/';
export const ctx = JSON.parse(document.getElementById('ctx').text);


ColorManagement.enabled = true;
const style = getComputedStyle(document.body);
export const theme = {//.convertSRGBToLinear(),
    primary: new Color(parseInt(style.getPropertyValue('--bs-primary').replace("#","0x"),16)),
    primary_s: new Color(parseInt(style.getPropertyValue('--bs-primary').replace("#","0x"),16)).convertLinearToSRGB(),
    secondary: new Color(parseInt(style.getPropertyValue('--bs-secondary').replace("#","0x"),16)),
    secondary_s: new Color(parseInt(style.getPropertyValue('--bs-secondary').replace("#","0x"),16)).convertLinearToSRGB(),
    success: new Color(parseInt(style.getPropertyValue('--bs-success').replace("#","0x"),16)), 
    success_s: new Color(parseInt(style.getPropertyValue('--bs-success').replace("#","0x"),16)).convertLinearToSRGB(), 
    info: new Color(parseInt(style.getPropertyValue('--bs-info').replace("#","0x"),16)),
    info_s: new Color(parseInt(style.getPropertyValue('--bs-info').replace("#","0x"),16)).convertLinearToSRGB(),
    warning: new Color(parseInt(style.getPropertyValue('--bs-warning').replace("#","0x"),16)),
    warning_s: new Color(parseInt(style.getPropertyValue('--bs-warning').replace("#","0x"),16)).convertLinearToSRGB(),
    danger: new Color(parseInt(style.getPropertyValue('--bs-danger').replace("#","0x"),16)),
    danger_s: new Color(parseInt(style.getPropertyValue('--bs-danger').replace("#","0x"),16)).convertLinearToSRGB(),
    light: new Color(parseInt(style.getPropertyValue('--bs-light').replace("#","0x"),16)),
    light_s: new Color(parseInt(style.getPropertyValue('--bs-light').replace("#","0x"),16)).convertLinearToSRGB(),
    dark: new Color(parseInt(style.getPropertyValue('--bs-dark').replace("#","0x"),16)),
    dark_s: new Color(parseInt(style.getPropertyValue('--bs-dark').replace("#","0x"),16)).convertLinearToSRGB(),
};


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

export const Fixed_Size_Group = forwardRef(function Fixed_Size_Group({size, props, children}, ref){
    const obj = useRef();
    const {camera} = useThree();
    useImperativeHandle(ref,()=>({ 
        obj:obj.current,
    }));
    useFrame(() => {
        var factor = size / camera.zoom;
        obj.current.scale.set(factor,factor,factor);
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


import {createUploadLink} from './upload/upload.js';
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
                {path:'',        element:r('p',{},'At Home')},
                {path:'catalog', element:r('p',{},'At Catalog')},
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