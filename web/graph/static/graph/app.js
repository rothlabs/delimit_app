import {produce, produceWithPatches, applyPatches, enablePatches, enableMapSet} from 'immer'; 
import {createWithEqualityFn} from 'zustand/traditional'
import {subscribeWithSelector} from 'zustand/middleware';
import {shallow} from 'zustand/shallow';
import {make_store} from './store/store.js';
import {is_formal_node_id} from 'delimit/common';
//import importShim from 'https://ga.jspm.io/npm:es-module-shims@1.6.2/dist/es-module-shims.wasm.js';

enablePatches();
enableMapSet();

const host_app_url = `https://delimit.art`;

export * from 'delimit/common'; // export const static_url = document.body.getAttribute('data-static-url');

//const is_temp_node_id = id => (/^[a-zA-Z0-9]+$/.test(id) && id.length != 32);

let current_state = null;
export const get_draft = () => current_state; // TODO: this might cause a serious problem with async ops

// TODO: find way to make get_draft from subscribeWithSelector work
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

let pending_imports = 0;
function update_from_host_app(patches){
    const state = applyPatches(get_store(), patches);
    store.setState(state);
    current_state = state;
    const code_changed = patches.some(({path}) => path[0]=='code_tick');
    function update_after_imports(){
        if(pending_imports > 0) pending_imports--;
        if(pending_imports > 0 || code_changed) return;
        const state = get_store();
        current_state = state;
        for(const patch of patches){
            if(is_scene_query(patch)){
                make_scene({state, node:patch.path[2], tick:patch.value});
            }else if(patch.path[0] == 'pattern_match'){
                match_pattern({state, pattern_match:patch.value});
            }
        }
    }
    let did_import_code = false;
    for(const patch of patches){
        if(is_code_update({patch})){
            pending_imports++;
            import_code({state, node:patch.path[1], api_key:patch.value, on_complete:update_after_imports});
            did_import_code = true;
        }
    }
    if(!did_import_code) update_after_imports();
}

function is_scene_query({path}){
    if(path.length != 3) return;
    if(path[0] == 'scene' && path[1] == 'sources') return true;
}

function is_code_update({patch:{path}}){
    if(path[0] == 'code_keys') return true;
}

function import_code({state, node, api_key='0', on_complete}){
    try{
        const name = state.get_leaf({root:node, term:'name', alt:'extension'});
        import('/extension/'+api_key+'/'+node+'/'+name+'.js').then(module => {
            module.initialize(node);
            on_complete(); // for(const func of on_complete) func();
        });
    }catch(e){
        on_complete();
        console.log('extension error');
        console.error(e.stack);
    }
}

function make_scene({state, node, tick}){
    const promise = query_node({state, node, get_scene:{}})
    promise.then(scene => {
        set_store(draft => draft.make_scene({source:node, scene, tick}));
    }, rejected => null);
}

function query_node({state, node, ...query_selection}){
    const [querier_name, args] = Object.entries(query_selection)[0];
    const code = state.get_stem({root:node, terms:'type code'})
    const querier = state.nodes.get(code)?.queriers?.get(querier_name);
    return new Promise((resolve, reject) => {
        if(!querier) reject('no querier');
        try{
            resolve(querier.execute({node, draft:state, ...args}));
            return;
        }catch{
            reject('failed query');
            return;
        }
    });
}

window.addEventListener('message', ({origin, data:{patches}}) => {
    if(origin !== host_app_url) return;
    if(patches) update_from_host_app(patches);
    parent.postMessage({tick:get_store().tick}, host_app_url);
});


// Currently finding index with smallest change to scene vector. 
function match_pattern({state, pattern_match}){
    const {root, term, stem} = pattern_match;
    let scene = state.query({root, name:'get_scene'});
    const start_vector = scene.vector; // TODO: rename polyline/mesh vector to mono_vector ?
    const count = state.nodes.get(root).terms.get(term).length;
    if(!start_vector || count < 1){
        parent.postMessage({pattern_match}, host_app_url);
        return;
    }
    let min_dist = Infinity;
    pattern_match.index = 0;
    produce(state, draft => { // set_store(draft => {
        current_state = draft;
        for (let index = 0; index <= count; index++){
            draft.make.edge({root, term, stem, index});
            scene = draft.query({root, name:'get_scene'});
            draft.drop.edge({root, term, stem, index});
            if(!scene.vector) continue;
            const dist = vector_distance(start_vector, scene.vector);
            if(dist < min_dist){
                min_dist = dist;
                pattern_match.index = index;
            }
        }
    });
    parent.postMessage({pattern_match}, host_app_url);
}

function vector_distance(vector1, vector2) {
    if (vector1.length !== vector2.length) {
        console.log("Vectors must be of the same length");//throw new Error("Vectors must be of the same length");
        return Infinity;
    }
    let sum_of_squares = 0;
    for (let i = 0; i < vector1.length; i++) {
        sum_of_squares += Math.pow(vector2[i] - vector1[i], 2);
    }
    return Math.sqrt(sum_of_squares);
}


// function vector_distance(vector1, vector2) {
//     if (vector1.length !== vector2.length) {
//         console.log("Vectors must be of the same length");//throw new Error("Vectors must be of the same length");
//         return Infinity;
//     }
//     let sum_of_squares = 0;
//     for (let i = 0; i < vector1.length; i++) {
//         sum_of_squares += Math.pow(vector2[i] - vector1[i], 2);
//     }
//     return Math.sqrt(sum_of_squares);
// }










    // return new Promise((resolve, reject) => {
    //     if(!querier) reject('no querier');
    //     //if(query_queue.host == 0){
    //         //query_queue.host = 'full';
    //         //query_queue.host++;
    //         //query_queue.host = 'full';
    //         let result = null;
    //         try{
    //             result = querier.execute({node_id:node, draft:state, ...args});
    //         }catch{
                
    //             //query_queue.host = 'empty';
    //             reject('failed query');
    //             return;
    //         }
    //         //query_queue.host--;
    //         resolve(result);
    //     //}else{
    //     //    console.log('full queue');
    //     //    reject('queue full');
    //     //}
    // });



// function update_from_host_app(patches){
//     const state = applyPatches(get_store(), patches);
//     store.setState(state);
//     current_state = state;
//     const stage = {imports:{}, scenes:{}};
//     for(const patch of patches){
//         if(is_code_update({patch})){
//             import_code({state, node:patch.path[1], api_key:patch.value});
//         }
//         if(is_scene_query(patch)){
//             make_scene({state, node:patch.path[2], tick:patch.value});
//         }
//     }
// }

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
    
    
    
    
    
    
    