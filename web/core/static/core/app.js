import {ApolloClient, InMemoryCache, createHttpLink, ApolloProvider, useQuery, gql} from 'apollo'; //makeVar, useReactiveVar, gql
import {setContext} from 'aclc';
import Cookie from "cookie";
import {createElement as r, StrictMode} from 'react';
import {createRoot} from 'rdc';
import {createBrowserRouter,RouterProvider, Outlet} from 'rrd';
import {Root} from './root.js';
import {Studio_Editor} from './studio/editor.js';
import {Studio_Browser} from './studio/browser.js';
import {Loading, Error_Page} from './feedback.js';
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

createRoot(document.getElementById('app')).render(r(()=>r(StrictMode,{},
    r(ApolloProvider,{client:new ApolloClient({link:auth_link.concat(http_link), cache:new InMemoryCache()})},
        r(RouterProvider, {router:createBrowserRouter([
            {path:'/', element:r(Root), errorElement:r(Error_Page), children:[
                {path:'',        element:r('p',{},'At Home')},
                {path:'catalog', element:r('p',{},'At Catalog')},
                {path:'studio',  element:r(Outlet), errorElement:r(Error_Page), children:[
                    {path:'',         element:r(Studio_Browser)},
                    {path:':id', element:r(Studio_Editor)},
                ]},
            ]},
        ])}),
    )
)));

export function use_db(queries){
    var header = '';
    var query = '';
    var variables = {};
    queries.forEach(q => {
        const q_words = q[0].split(' ');
        query += ' '+q_words[0]; // model name
        if(q.length>1) {
            header += 'header(';
            query += '(';
        }
        for(var i=1; i<q.length; i++){ //for (const [key, value] of Object.entries(q)) {
            const q_var_meta = q[i][0].split(' ');
            header += '$' + q_var_meta[1] + ': ' + q_var_meta[0];
            query += q_var_meta[1] + ': $' + q_var_meta[1];
            if(i<q.length-1){
                header += ', ';
                query += ', ';
            }
            set(variables, q_var_meta[1], q[i][1]);
        }
        if(q.length>1){
            header += ')';
            query += ')';
        }
        query += '{'+q[0].slice(q_words[0].length+1)+'}';
    });
    //console.log(header);
    //console.log(query);
    //console.log(variables);
    const {loading, error, data} = useQuery(
        gql`query ${header}{${query}}`, 
        {variables:variables, fetchPolicy:'no-cache'} // Add option for cache
    ); 
    var alt = null;
	if (loading) alt = Loading;
    if (error)   alt = Error_Page;
    return {data, alt};
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