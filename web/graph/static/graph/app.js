import {applyPatches, produceWithPatches, enablePatches, enableMapSet} from 'immer'; 
import {createWithEqualityFn} from 'zustand/traditional'
import {subscribeWithSelector} from 'zustand/middleware';
import {shallow} from 'zustand/shallow';
import {core_store} from './store/store.js';

enablePatches();
enableMapSet();
const store = createWithEqualityFn(subscribeWithSelector(() => core_store), shallow);
export const get_store = () => store.getState();

const host_app_url = `https://delimit.art`;

window.addEventListener('message', ({origin, data:{mutate, query}}) => {
    if(origin !== host_app_url) return;
    if(mutate) update_from_host_app(mutate);
    if(query) run_query(query);
});

function update_from_host_app({patches}){
    if(patches) store.setState(d => applyPatches(d, patches));
}

function run_query({scenes}){
    const d = get_store();
    let result = {};
    if(scenes) result = d.get_scenes(d, {roots:scenes});
    parent.postMessage(result, host_app_url);
}









let worker = new Worker('static/graph/workerloader.js');
worker.addEventListener('error', e => {
    console.error('Graph worker error');
    console.error(e);
});
worker.addEventListener('message', e => {
    let result = e.data;
    if (result === "loaded loader"){
         console.log("loaded the workerloaded");
    } else if (result === "Module worker Loaded")
        worker.postMessage("Init Message");
    else
        console.log(`message from worker: `, e);
});






// const myWorker = new Worker('worker.js', {type: 'module'});

// myWorker.onerror = (event) => {
//     console.log("Worker Error", event);
// };

// myWorker.postMessage(['testing', 'so cool if this works']);
// console.log("Message posted to worker");



// import Cookie from 'js-cookie';
// import {ApolloClient, InMemoryCache, gql, createHttpLink} from '../core/apollo/ApolloClient.js'; // '@apollo/client/core';
// import {setContext} from '../core/apollo/ApolloContext.js'; // '@apollo/client/link/context';
// import {Vector3} from 'three';
// const auth_link = setContext((_,{headers})=>{return{headers:{...headers,
//     'x-csrftoken': Cookie.get('csrftoken'),
// }}});
// const termination_link = createHttpLink({
//     uri: 'https://delimit.art/gql',
// });
// const apollo = new ApolloClient({
//     link:  auth_link.concat(termination_link), 
//     cache: new InMemoryCache(),
// });
// apollo.query({
//     query: gql`query TestQuery {
//         launch(id: 56) {
//             id
//             mission {
//                 name
//             }
//         }
//     }`,
//     variables: {key: 'testing testing'},
// }).then(result => {
//     console.log(result)
// });


// const v = new Vector3(1, 2, 3);

// console.log('vector from graph app!', v);

// console.log(parent);

// window.addEventListener("message", event => {
//     if(event.origin !== 'https://delimit.art') return;
    
//     console.log("message event on graph!!!!!!!!");
//     // event.source is window.opener
//     // event.data is "hello there!"
    
//     // Assuming you've verified the origin of the received message (which
//     // you must do in any case), a convenient idiom for replying to a
//     // message is to call postMessage on event.source and provide
//     // event.origin as the targetOrigin.
//     event.source.postMessage(
//         "hi there yourself!  the secret response " + "is: rheeeeet!",
//         event.origin,
//         );
//     });
    
    
    
    
    
    
    