import {ApolloClient, InMemoryCache, createHttpLink, ApolloProvider, useQuery, useMutation, gql, makeVar} from 'apollo'; //makeVar, useReactiveVar, gql
import {setContext} from 'aclc';
import Cookie from "cookie";
import {createElement as r, StrictMode} from 'react';
import {createRoot} from 'rdc';
import {createBrowserRouter,RouterProvider, Outlet} from 'rrd';
import {Root} from './root.js';
import {Studio_Editor} from './studio/editor.js';
import {Studio_Browser} from './studio/browser.js';
import {Loading, Router_Error, } from './feedback.js';
import {Color, ColorManagement} from 'three'; 
import set from 'lodash';


const http_link = createHttpLink({uri:'https://delimit.art/gql'});
const auth_link = setContext((_,{headers})=>{return{headers:{...headers,
    'x-csrftoken': Cookie.get('csrftoken'),
}}});

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

createRoot(document.getElementById('app')).render(r(()=>r(StrictMode,{},
    r(ApolloProvider,{client:new ApolloClient({link:auth_link.concat(http_link), cache:new InMemoryCache()})},
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

function compile_gql(name, gql_parts){
    var header = '';
    var body = '';
    var variables = {};
    gql_parts.forEach(q => {
        const q_words = q[0].split(' ');
        body += q_words[0];
        if(q.length>1) body += '(';
        for(var i=1; i<q.length; i++){ 
            const q_var_meta = q[i][0].split(' ');
            header += '$' + q_var_meta[1] + ': ' + q_var_meta[0];
            body += q_var_meta[1] + ': $' + q_var_meta[1];
            if(i<q.length-1){
                header += ', ';
                body += ', ';
            }else{ body += ')'; }
            set(variables, q_var_meta[1], q[i][1]);
        }
        //if(q.length>1) body += ')';
        //if(q.length>1) body = '(' +body+ ')';
        //body = q_words[0] + body + '{'+q[0].slice(q_words[0].length+1)+'}'; 
        body += '{'+q[0].slice(q_words[0].length+1)+'} '; 
    });
    if(header.length>0) header = '(' + header + ')';
    header = name + header;
    return {header, body, variables}
}

export function use_query(name, gql_parts){
    const {header, body, variables} = compile_gql(name, gql_parts);
    //console.log(header);
    //console.log(body);
    //console.log(variables);
    const {loading, error, data} = useQuery(
        gql`query ${header}{${body}}`, 
        {variables:variables} // Add option for cache fetchPolicy:'no-cache'
    ); 
    var alt = null;
	if (loading) alt = Loading;
    if (error)   alt = r(GQL_Error, {message: error.message});
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
	if (loading) alt = Loading;
    if (error) alt = r(GQL_Error, {message: error.message});
    return [mutate, data, alt, reset];
}

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