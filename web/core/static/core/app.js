import {ApolloClient, InMemoryCache, createHttpLink, ApolloProvider} from 'apollo'; //makeVar, useReactiveVar, gql
import {setContext} from 'aclc';
import Cookie from "cookie";
import {createElement as r, StrictMode} from 'react';
import {createRoot} from 'rdc';
import {createBrowserRouter,RouterProvider} from 'rrd';
import {Root} from './root.js';
import {Studio} from './studio/studio.js';

const http_link = createHttpLink({uri:'https://delimit.art/gql-public'});
const auth_link = setContext((_,{headers})=>{return{headers:{...headers,
    'x-csrftoken': Cookie.get('csrftoken'),
}}});

const style = getComputedStyle(document.body);
export const dd = {
    ...JSON.parse(document.getElementById('dd').innerHTML),
    theme:{
        primary: style.getPropertyValue('--bs-primary'),
        secondary: style.getPropertyValue('--bs-secondary'),
        success: style.getPropertyValue('--bs-success'),
        info: style.getPropertyValue('--bs-info'),
        warning: style.getPropertyValue('--bs-warning'),
        danger: style.getPropertyValue('--bs-danger'),
        light: style.getPropertyValue('--bs-light'),
        dark: style.getPropertyValue('--bs-dark'),
    },
}

console.log(dd.theme);

createRoot(document.getElementById('app')).render(r(()=>r(StrictMode,{},
    r(ApolloProvider,{client:new ApolloClient({link:auth_link.concat(http_link), cache:new InMemoryCache()})},
        r(RouterProvider, {router:createBrowserRouter([
            {path:'/', element:r(Root), children:[
                {path:'',        element:r('p',{},'At Home'), },
                {path:'catalog', element:r('p',{},'At Catalog'), },
                {path:'studio',  element:r(Studio,{product_url:'https://delimit.art/media/product/default.glb'})},
            ]},
        ])}),
    )
)));



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