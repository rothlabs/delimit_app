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
import {Router_Error} from './component/app/feedback.js';

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


const defaultOptions = {
    watchQuery: {fetchPolicy:'no-cache'}, // errorPolicy: 'ignore',
    query: {fetchPolicy:'no-cache'}, // errorPolicy: 'all',
}
export const gql_client = new ApolloClient({
    link: auth_link.concat(termination_link), // link: concat(authMiddleware, httpLink),
    cache: new InMemoryCache(),
    defaultOptions, 
});

createRoot(document.getElementById('app')).render(r(()=>
    //r(StrictMode,{},
        r(ApolloProvider, {client: gql_client},
            r(RouterProvider, {router:createBrowserRouter([
                {path:'/', element:r(Root), errorElement:r(Router_Error), children:[
                    {path:'',        element:r(Home)},
                    {path:'shop',    element:r('p',{}, 'At Shop')},
                    {path:'studio',  element:r(Studio), errorElement:r(Router_Error)},  
                ]},
            ])}),
        )
    //)
));