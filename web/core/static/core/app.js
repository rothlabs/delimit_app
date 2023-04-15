import {ApolloClient, InMemoryCache, createHttpLink, ApolloProvider, useQuery, useMutation, gql, makeVar} from 'apollo'; //makeVar, useReactiveVar, gql
import {setContext} from 'aclc';
//import {createUploadLink} from 'auc';
import Cookie from "cookie";
import {createElement as r, StrictMode, useEffect, useState} from 'react';
import {createRoot} from 'rdc';
import {createBrowserRouter,RouterProvider, Outlet} from 'rrd';
import {Root} from './root.js';
import {Studio_Editor} from './studio/editor.js';
import {Studio_Browser} from './studio/browser.js';
import {Loading, Router_Error, GQL_Error} from './feedback.js';
import {Color, ColorManagement} from 'three'; 
import set from 'lodash';
import {useGLTF} from 'drei';
import * as THREE from 'three';

//import apolloUploadClient from 'https://cdn.jsdelivr.net/npm/apollo-upload-client/+esm';
//"auc":       "https://esm.sh/apollo-upload-client?pin=v106",
import {createUploadLink} from './upload/upload.js';


const auth_link = setContext((_,{headers})=>{return{headers:{...headers,
    'x-csrftoken': Cookie.get('csrftoken'),
}}});
//const http_link = createHttpLink({uri:'https://delimit.art/gql'});
const termination_link = createUploadLink({
    uri: 'https://delimit.art/gql',
    headers: {
       'Apollo-Require-Preflight': 'true',
    },
});

export const media_url = document.body.getAttribute('data-media-url');
export const static_url = document.body.getAttribute('data-static-url');

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

//export const client = new ApolloClient({link:auth_link.concat(http_link), cache:new InMemoryCache()});
//export const current_user_id = makeVar(-1);

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
            if(i<q.length-1){//header += ', ';
                body += ', ';
            }else{ body += ')'; }
            set(variables, q_var_meta[1], q[i][1]);
            header_vars.push(q_var_meta[1]);
        }
        //if(q.length>1) body += ')';
        //if(q.length>1) body = '(' +body+ ')';
        //body = q_words[0] + body + '{'+q[0].slice(q_words[0].length+1)+'}'; 
        body += '{'+q[0].slice(q_words[0].length+1)+'} '; 
    });
    if(header.length>0) header = '(' + header.slice(2) + ')';
    header = name + header;
    return {header, body, variables}
}

export function use_query(name, gql_parts, fetchPolicy=null, reactive_var){ // 'cache-and-network'
    //console.log(fetchPolicy);
    const {header, body, variables} = compile_gql(name, gql_parts);
    //console.log({header, body, variables});
    const {loading, error, data} = useQuery(
        gql`query ${header}{${body}}`, 
        {variables:variables, fetchPolicy:fetchPolicy} // Add option for cache fetchPolicy:'no-cache'
    ); 
    var alt = null;
	if(loading) alt =     Loading;
    if(error)   alt =()=> r(GQL_Error, {message: error.message});
    if(reactive_var) reactive_var(data);
    return [data, alt];
}

export function use_mutation(gql_parts, refetch){
    const {header, body, variables} = compile_gql('Mutation', gql_parts);
    //console.log({header, body, variables});
    const [mutate, {data, loading, error, reset}] = useMutation( 
        gql`mutation ${header}{${body}}`, 
        {variables:variables, refetchQueries:refetch.split(' ')} // Add option for cache
    ); 
    var alt = null;
	if (loading) alt =     Loading;
    if (error)   alt =()=> r(GQL_Error, {message: error.message});
    return [mutate, data, alt, reset];
}

export function use_media_glb(url){
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

export function child(source, name, func){ // use Array.find(test_func) see moz docs
    //var response = undefined;
    if(source){
        const c = source.children.find(c=> c.name.slice(0,name.length)==name)
        if(c) return func(c);
        //source.children.forEach(child => {
        //    if(child.name.slice(0,name.length) == name) response = func(child);
        //});
    }
    //return response;
}

export function use_effect(deps, func){
    useEffect(()=> {
        //console.log(deps);
        if(!deps.includes(undefined) && !deps.includes(null) && !deps.includes([])) func(); // only run func if all dependencies contain a value
    }, deps); 
}

// For gltf items. Example: sketch__37 has type 'sketch' and id 37
export const is_type=(target, name)=> target.name.split('__')[0]==name;
export const id_of=(target)=> target.name.split('__')[1];

createRoot(document.getElementById('app')).render(r(()=>r(StrictMode,{},
    r(ApolloProvider,{client:new ApolloClient({link:auth_link.concat(termination_link), cache:new InMemoryCache()})},
        r(RouterProvider, {router:createBrowserRouter([
            {path:'/', element:r(Root), errorElement:r(Router_Error), children:[
                {path:'',        element:r('p',{},'At Home')},
                {path:'catalog', element:r('p',{},'At Catalog')},
                {path:'studio',  element:r(Outlet), errorElement:r(Router_Error), children:[
                    {path:'',       element:r(Studio_Browser)},
                    {path:':id',    element:r(Studio_Editor)},
                ]},
            ]},
        ])}),
    )
)));



// export function child(source, name){
//     if(source){
//         source.children.forEach(n => {
//             if(n.name.slice(0,name.length) == name) {
//                 console.log(n);
//                 return n;
//             }
//         });
//     }
//     return null;
// }

//export const empty_verts = new Float32Array([0,0,0,0,0,0]);


// export function for_child(source, name, func){
//     var child = null;
//     if(source){
//         source.children.forEach(c => {
//             if(c.name.slice(0,name.length) == name){
//                 func(c);
//                 child = c;
//             }
//         });
//     }
//     return child;
// }

// export function use_server(query, args){
//     const {loading, error, data} = useQuery(gql`query{ 
//             ${query}
//     }`, {fetchPolicy:'no-cache'}); // Add option for cache
//     var alt = null;
// 	if (loading) alt = Loading;
//     if (error)   alt = Error_Page;
//     return {data, alt};
// }

// Query($placeholder: String)




// export const app = {
//     logo:'/static/core/logo.svg',
// };

// const client = new ApolloClient({
//     link: auth_link.concat(http_link),
//     cache: new InMemoryCache(),
// });


// const router = createBrowserRouter([
//     {path:'/', element:r(Nav_Bar), children:[
//         {path:'', element:r('p',{},'At Home'), },
//         {path:'catalog', element:r('p',{},'At Catalog'), },
//         {path:'studio', element:r(Studio,{product_url:'https://delimit.art/media/product/default.glb'}), },
//     ]},
// ]);


//const start = JSON.parse(document.getElementById('start').innerHTML); 
//console.log(start);
//var push_window_history = true;
//export const page_var = makeVar(start.page);
// function Page(){
//     const page = useReactiveVar(page_var);
//     useEffect(()=>{
//         if(push_window_history) window.history.pushState({page:page},'',page);
//         push_window_history = true;
//     },[page]);
//     if(page=='/')          return r('p',{},'At Home')
//     if(page=='catalog')    return r('p',{},'At Catalog')
//     if(page=='studio')     return r(Studio,{product_url:'https://delimit.art/media/product/default.glb'})
// }




//r(App));

//window.onpopstate = function(e){
//    if(e.state.page != undefined){
//        push_window_history = false;
//        page_var(e.state.page);
//    }
//}; 

// client.query({query:gql`query{ 
//     products {
//         id
//         name
//         date
//         file
//     }
// }`}).then((result) => console.log(result));