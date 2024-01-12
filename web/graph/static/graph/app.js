import {applyPatches, produceWithPatches, enablePatches, enableMapSet} from 'immer'; 
import {createWithEqualityFn} from 'zustand/traditional'
import {subscribeWithSelector} from 'zustand/middleware';
import {shallow} from 'zustand/shallow';
import {store as graph_store} from './store/store.js';

enablePatches();
enableMapSet();

const host_app_url = `https://delimit.art`;

const is_free_node_id = id => (/^[a-zA-Z0-9]+$/.test(id) && id.length != 32);

const store = createWithEqualityFn(subscribeWithSelector(() => graph_store), shallow);

export const get_store = () => store.getState();

export const set_store = func => {
    const [state, patches, inverse] = produceWithPatches(get_store(), draft => { func(draft) });
    //console.log(patches);
    if(!patches.length) return;
    set_state(state, patches);
    return [state, patches, inverse];
};

function set_state(state, patches){
    store.setState(state); 
    send_patches_to_host_app(patches);
}

function is_patch_for_host_app(path){
    if(path[0] == 'nodes' && is_free_node_id(path[1])) return true;
}

function send_patches_to_host_app(patches){
    patches = patches.filter(({path}) => is_patch_for_host_app(path));
    if(!patches.length) return;
    parent.postMessage({patches}, host_app_url);
}

window.addEventListener('message', ({origin, data:{patches}}) => {
    if(origin !== host_app_url) return;
    if(patches) update_from_host_app(patches);
});

function update_from_host_app(patches){
    console.log('update from host', patches);
    store.setState(state => applyPatches(state, patches));
    for(const patch of patches){
        if(is_scene_query(patch)) set_store(d=> d.make_scene(d, {node:patch.path[2]}));
    }
}

function is_scene_query({path}){
    if(path.length != 3) return;
    if(path[0] == 'scene' && path[1] == 'sources') return true;
}

// function run_query({scenes}){
//     const state = get_store();
//     let result = {};
//     if(scenes) result = state.get_scenes(state, {roots:scenes});
//     parent.postMessage(result, host_app_url);
// }









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
    
    
    
    
    
    
    