import {applyPatches, produceWithPatches, enablePatches, enableMapSet} from 'immer'; 
import {createWithEqualityFn} from 'zustand/traditional'
import {subscribeWithSelector} from 'zustand/middleware';
import {shallow} from 'zustand/shallow';
import {make_store} from './store/store.js';
import {is_formal_node_id} from '../common/common.js';
//import importShim from 'https://ga.jspm.io/npm:es-module-shims@1.6.2/dist/es-module-shims.wasm.js';

export {is_formal_node_id} from '../common/common.js';

enablePatches();
enableMapSet();

const host_app_url = `https://delimit.art`;

//const is_temp_node_id = id => (/^[a-zA-Z0-9]+$/.test(id) && id.length != 32);

let current_state = null;
export const get_draft = () => current_state;

const store = createWithEqualityFn(subscribeWithSelector(() => make_store(get_draft)), shallow);

export const get_store = () => store.getState();

export const set_store = func => {
    const [state, patches] = produceWithPatches(get_store(), draft => { 
        current_state = draft;
        func(draft);
    });
    if(!patches.length) return;
    set_state(state, patches);
};

function set_state(state, patches){
    store.setState(state); 
    current_state = state;
    send_patches_to_host_app(patches);
}

function is_patch_for_host_app(path){
    if(path[0] == 'nodes' && !is_formal_node_id(path[1])) return true;
}

function send_patches_to_host_app(patches){
    patches = patches.filter(({path}) => is_patch_for_host_app(path));
    if(!patches.length) return;
    parent.postMessage({patches}, host_app_url);
}

function update_from_host_app(patches){
    const state = applyPatches(get_store(), patches);
    store.setState(state);
    current_state = state;
    for(const patch of patches){
        if(is_code_update({state, patch})){
            import_code({state, code_node:patch.path[1], api_key:patch.value});
        }
        if(is_scene_query(patch)){
            make_scene({state, source_node:patch.path[2]});
        }
    }
}

function is_scene_query({path}){
    if(path.length != 3) return;
    if(path[0] == 'scene' && path[1] == 'sources') return true;
}

function is_code_update({state, patch:{path}}){
    if(path[0] == 'code_keys') return true;
}

//let code_counter = 0;
let current_node = null;
export const set_current_node = node => current_node = node;
export const get_current_node = () => current_node;
function import_code({state, code_node, api_key='0'}){
    //code_counter++;
    const name = state.get_leaf({root:code_node, term:'name', alt:'extension'});
    import('/extension/'+api_key+'/'+code_node+'/'+name+'.js'); // code_counter
    //current_node = code_node;
    //import('/'+code_node+'/'+code_counter+'/extension.js'); // .then(module => console.log('loaded new code'));
}

function make_scene({state, source_node}){
    const promise = query_node({state, node:source_node, get_scene:{}})
    promise.then(scene_tree => {
        set_store(draft => draft.make_scene({source_node, scene_tree}));
    }, rejected => rejected);
}

function query_node({state, node, ...query_selection}){
    const [query_name, args] = Object.entries(query_selection)[0];
    const code = state.get_stem({root:node, terms:'type code'})
    const query = state.nodes.get(code)?.queries?.get(query_name);
    return new Promise((resolve, reject) => {
        if(!query) reject('no query');
        resolve(query.execute({node, ...args}));
    });
}

window.addEventListener('message', ({origin, data:{patches}}) => {
    if(origin !== host_app_url) return;
    if(patches) update_from_host_app(patches);
});


        // setTimeout(() => {
        //     resolve('resolved');
        //   }, 2000);


// // // let worker = new Worker('static/graph/workerloader.js');
// // // worker.addEventListener('error', e => {
// // //     console.error('Graph worker error');
// // //     console.error(e);
// // // });
// // // worker.addEventListener('message', e => {
// // //     let result = e.data;
// // //     if (result === "loaded loader"){
// // //          console.log("loaded the workerloaded");
// // //     } else if (result === "Module worker Loaded")
// // //         worker.postMessage("Init Message");
// // //     else
// // //         console.log(`message from worker: `, e);
// // // });


// function is_code_update({state, patch:{path}}){
//     if(path[0] != 'nodes') return;
//     const root = path[1];
//     if(!is_formal_node_id(root)) return;
//     if(state.get_leaf({root, term:'language'}) != 'javascript') return;
//     if(!state.get_leaf({root, term:'source'})) return;
//     return true;
// }

    //current_draft = get_store();
    // for(const patch of patches){
    //     if(is_code_update({draft:current_draft, patch})){
    //         import_code({code_node:patch.path[1]});
    //         //set_store(draft => draft.import_code({code_node:patch.path[1]}));
    //     }
    //     if(is_scene_query(patch)){
    //         set_store(draft => draft.make_scene({source_node:patch.path[2]}));
    //     }
    // }




//if(!state.nodes.has(root)) return;
    //const terms = state.nodes.get(root).terms; 
    //const roots = state.nodes.get(node).roots; 

// function run_query({scenes}){
//     const state = get_store();
//     let result = {};
//     if(scenes) result = state.get_scenes(state, {roots:scenes});
//     parent.postMessage(result, host_app_url);
// }






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
    
    
    
    
    
    
    