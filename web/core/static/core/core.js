import {applyPatches, produceWithPatches, enablePatches, enableMapSet} from 'immer'; 
import {createWithEqualityFn} from 'zustand/traditional'
import {subscribeWithSelector} from 'zustand/middleware';
import {shallow} from 'zustand/shallow';
import {createElement as c, useEffect, useState, useLayoutEffect} from 'react';
import {make_store} from './store/store.js';
import {Vector2, Vector3, Matrix4} from 'three'; // ColorManagement.enabled = true;
import {send_updates_to_server} from './app/send.js'
import {is_formal_node_id} from 'delimit/common';

export * from 'delimit/common'; 
export {gql_client} from './app.js';
export * from './app/gql.js';
export * from './app/pick.js';
export * from './app/icon.js';
export * from './component/app/app.js'; 
export * from './component/app/confirm.js'; 
export * from './component/app/token.js';
export * from './component/app/view_transform.js';
export * from './component/studio/server_mutations.js';
export * from './component/studio/scene_query.js';
export * from './component/studio/repo_browser.js';
export * from './component/studio/viewport.js';
export * from './component/studio/code_editor.js';
export * from './component/panel/make_repo.js';
export * from './component/panel/make_node.js';
export * from './component/panel/repo_editor.js';
export * from './component/panel/node_editor.js';
export * from './component/panel/scene_editor.js';
export * from './component/panel/term_editor.js';
export * from './component/graph/graph.js';
export * from './component/scene/scene.js';

enableMapSet();
enablePatches();

// solve by modifying source file, alternative solution:
// https://github.com/pmndrs/react-spring/issues/1586
// import {Globals} from '@react-spring/three';
// Globals.assign({ 
//     frameLoop: "always",
// });

//export const static_url = document.body.getAttribute('data-static-url');


export const assess = (obj, args) => (typeof obj === 'function' ? obj(args) : obj); // (Object.keys(obj).length ? obj : null) 

// export const make_id = (length=16)=>{
//     let result = '';
//     Array.from({length}).some(() => {
//         result += Math.random().toString(36).slice(2); // always hear that Math.random is not good for id generation
//         return result.length >= length;
//     });
//     return result.substring(0, length);
// };

let patch_index = 0;
let patches_history = [];
let inverse_history = [];
let current_draft = null;

export const get_draft = () => current_draft;

const store = createWithEqualityFn(subscribeWithSelector(() => make_store(get_draft)), shallow);
store.setState(d=>{  d.init(d); return d;  });
export const get_store = () => store.getState();
export function use_store(selector, a={}){
    if(a.subscribe){
        const args = {fireImmediately:true, equalityFn:shallow};
        return useEffect(()=>store.subscribe(state => {
            current_draft = state; 
            return selector(state);
        }, a.subscribe, args), []);
    }
    //if(a.shallow) return store(selector, shallow);
    return store(state => {
        current_draft = state; // TODO: check if can be removed
        return selector(state);
    });
}
//export const use_store_shallow = selector=> store(selector, shallow);
///////export const use_subscription  = (selector, callback, triggers=[])=> useEffect(()=>store.subscribe(selector, callback, {fireImmediately:true}), triggers);
////////export const subscribe_shallow = (selector, callback)=> useEffect(()=>store.subscribe(selector, callback, {fireImmediately:true,equalityFn:shallow}),[]);
//export const subS  = (selector, callback)=> store.subscribe(selector, callback, {fireImmediately:true});
//export const subSS = (selector, callback)=> store.subscribe(selector, callback, {fireImmediately:true, equalityFn:shallow});
//export const subSSI = (selector, callback)=> store.subscribe(selector, callback, {equalityFn:shallow,fireImmediately:true,});

export const controls = {
    pointer:{
        position: new Vector2(),
        start: new Vector2(),
        delta: new Vector2(),
    },
    projection:{
        position: new Vector3(),
        start: new Vector3(),
    },
    scene: {
        view:{},
        start: new Vector3(),
        end: new Vector3(),
    },
    camera: null,
    graph: {view:{}},
    drag: {
        tick:0,
        resolve: () => null,
        start: new Vector3(),
        matrix: new Matrix4(),
    },
};
// const transient_store = createWithEqualityFn(subscribeWithSelector(() => transient), shallow);
// export function use_transient(selector, a={}){
//     if(a.subscribe){
//         const args = {fireImmediately:true};
//         return useEffect(()=>transient_store.subscribe(selector, a.subscribe, args), []);
//     }
//     return transient_store(selector);
// }
// export function set_transient(func){
//     transient_store.setState(produce(d=>{ func(d) }));
// }


// var fork = null; // state fork for interactive stuff like dragging 
// var original_fork = null;


function set_state(state, patches){
    store.setState(state); 
    send_patches_to_graph_app(patches);
}


// set state without committing to history or server 
export const set_store = (func, prep) => {
    //console.log('recieve state');
    //const result = next_state(get_store(), func); 
    // if(fork){
    //     fork = applyPatches(fork, result.patches);
    //     //original_fork = applyPatches(original_fork, result.patches);
    // }
    //var [nextState] = produceWithPatches(get_store(), d=>{ func(d) }); 
    //store.setState(nextState); 
    let [state, patches, inverse] = produceWithPatches(get_store(), draft => { 
        current_draft = draft;
        prep ? prep(draft) : func(draft);
    });
    if(prep){
        [state, patches, inverse] = produceWithPatches(state, draft => { 
            current_draft = draft;
            func(draft);
        });
    }
    //console.log(patches);
    if(!patches.length) return [state];
    set_state(state, patches);
    return [state, patches, inverse];
};

// export const run_action_on_store = func => {
//     var [state, patches, inverse] = produceWithPatches(get_store(), draft=>{ func(draft) }); 
//     if(!patches.length) return {};
//     set_state(state, patches);
//     return {state, patches, inverse}
// }

export const act_on_store = (func, prep) => {
    const [state, patches, inverse] = set_store(func, prep);
    if(!patches) return; //store.setState(state);
    if(patches_history.length > patch_index){
        patches_history.splice(patch_index, patches_history.length - patch_index);
        inverse_history.splice(patch_index, inverse_history.length - patch_index);
    }
    patches_history.push(patches);
    inverse_history.push(inverse);
    patch_index = patches_history.length;
    send_updates_to_server(state, patches);
};

export const act_on_store_without_history = func => {
    const [state, patches] = set_store(func);
    if(!patches) return;
    send_updates_to_server(state, patches);
}

export const act_on_store_with_prep = ({prep, act}) => act_on_store(act, prep);

// export const clear_history = () => {
//     patch_index = 0;
//     patches_history = [];
//     inverse_history = [];
// }

function apply_patches(patches){
    const state = applyPatches(get_store(), patches);
    set_state(state, patches);
    send_updates_to_server(state, patches);
}

export const graph_app_url = `https://graph.delimit.art`;
const graph_app_element = document.getElementById('graph_app').contentWindow;

function is_patch_for_graph_app(path){
    if(path[0] == 'nodes'){
        if(is_formal_node_id(path[1])) return true;
    }else if(path[0] == 'scene' && path[1] == 'sources'){
        if(is_formal_node_id(path[2])) return true; // }else if(path[0] == 'to_graph_app'){//
    }else if(['tick', 'code_tick', 'code_keys', 'pattern_match'].includes(path[0])){ //path[0] == 'code_keys' || path[0] == 'code_tick'
        return true;
    }
}

function send_patches_to_graph_app(patches){
    patches = patches.filter(({path}) => is_patch_for_graph_app(path));
    if(!patches.length) return;
    graph_app_element.postMessage({patches}, graph_app_url); // state.graph_app.mutate({patches});
}

window.addEventListener('message', ({origin, data:{patches, tick, pattern_match}}) => {
    if(origin !== graph_app_url) return;
    if(patches) update_from_patches(patches);//set_store(d=> d.scene.update_from_graph_app(d, scenes));
    if(tick){ // TODO: rename to drag_tick?
        controls.drag.tick = tick;
        controls.drag.resolve();
    }
    if(pattern_match) update_from_pattern_match(pattern_match);
});

function update_from_pattern_match(pattern_match){
    act_on_store(d => {
        if(pattern_match.key !== d.pattern_match.key) return;
        const {root, term, stem, index} = pattern_match;
        d.make.edge(d, {root, term, stem, index});
    });
}

function update_from_patches(patches){
    //console.log('got patches from graph app!!', patches);
    patches = patches.map(({op, path, value}) => ({ // TODO: if a node doesn't exist, reset the scene tree!
        path: (path[0]==='nodes' && !is_formal_node_id(path[1])) ? path : null,
        op, value,
    })).filter(patch => (patch.path != null));
    store.setState(state => applyPatches(state, patches)); 
}


export function undo(){ // skip/ignore patches that try to operate on dropped versions
    if(patch_index > 0){
        patch_index--;

        //store.setState(d => {
            try{
                //const patches = inverse_history[patch_index];
                apply_patches(inverse_history[patch_index]);
                // const state = applyPatches(get_store(), patches);
                // store.setState(state);
                // state.send_patches_to_graph_app(state, patches);
                // send_updates_to_server(state, patches);
                //return state;
            }catch{
                console.log('undo failed');
                //return d;
            }
        //});
    }
}
export function redo(){ 
    if(patch_index < patches_history.length){
        //store.setState(d=>{
            try{
                //const patches = patches_history[patch_index];
                apply_patches(patches_history[patch_index]);
                // const state = applyPatches(get_store(), patches);
                // store.setState(state);
                // state.send_patches_to_graph_app(state, patches);
                // send_updates_to_server(state, patches);
                //return draft;
            }catch{
                console.log('redo failed');
                //return d;
            }
        //});
        patch_index++;
    }
}

export function use_window_size(){
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return [size[0], size[1]];
}

export function readable(s){
    return s.toLowerCase().split('_').map(s=> s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
}

export function get_snake_case(s){
    return s.toLowerCase().replace(/ /g,'_');
}

export function get_upper_snake_case(s){
    return s.toLowerCase().split('_').map(s=> s.charAt(0).toUpperCase() + s.substring(1)).join('_');
}


document.addEventListener('contextmenu', event => {
    event.preventDefault();
});





// // fork state
// export const fork_store = func=>{                 // this might be the secret sauce to async functions! #1
//     //console.log('fork state');
//     fork = next_state(get_store(), func).state;
//     //original_fork = next_state(get_store(), func).state;;
// }; 

// // set fork
// export const set_fork = func=>{
//     //console.log('set fork');
//     if(fork != null){
//         next_state(fork, func);//.state;
//         //fork = next_state(fork, func).state; 
//     }else{
//         console.log('TRIED TO SET STATE FORK THAT DOES NOT EXIST!');
//         //assert(false, 'TRIED TO SET STATE FORK THAT DOES NOT EXIST!');
//     }
//     //next_state(fork, func);
// }; 

// // merge fork
// export const merge_fork = func=>{ // watch out for no-change resulting in undefined d!?!?!
//     if(fork != null){
//         console.log('merge state!');
//         commit_state(next_state(fork, func));
//         //commit_state(next_state(original_fork, func));
//         fork = null;
//     }else{
//         console.log('TRIED TO MERGE STATE FORK THAT DOES NOT EXIST!');
//         //assert(false, 'TRIED TO MERGE STATE FORK THAT DOES NOT EXIST!');
//     }
// }; 


// function next_state(state, func){
//     //var all_patches = [];
//     //var all_inverse = [];
//     let cancel = false;
//     var [nextState, patches, inversePatches] = produceWithPatches(state, d=>{ 
//         cancel = func(d); 
//     }); 
//     if(cancel) return {cancel:true};
//     //[d, patches, inverse_patches] d.next_funcs=[]; d.next_ids=[]; 
//     // while(result[1].length > 0){
//     //     all_patches = [...all_patches, ...result[1]];
//     //     all_inverse = [...result[2], ...all_inverse];
//     //     result = produceWithPatches(result[0], d=>{ if(d) d.continue(d); }); //result = produceWithPatches(result[0], d=>{ d.continue(d) }); 
//     // }
//     store.setState(nextState); 
//     return {state:nextState, patches, inverse:inversePatches}; // rename state to d
// }

// // function ignore_patch(p){
// //     const path = p.path.join('.');
// //     if(path == 'studio.panel') return false;
// //     if(path == 'studio.panel.show') return false;
// //     if(path == 'studio.panel.mode') return false;
// //     if(path == 'design.matrix') return false;
// //     if(path == 'design.act') return false; // 'design.moving'
// //     //if(path == 'graph.c_c') return false;
// //     if(path == 'studio.gizmo_active') return false; 
// //     //if(path == 'studio.cam_info') return false;
// //     //if(path == 'design.n') return false;
// //     //if(path == 'design.group') return false;
    
// //     //if(p.path.includes('pick')) return false;
// //     return true;
// // }
// //const ignored_node_props = ['repo', 'pick', 'hover', 'pos', 'c_c'];
// function commit_state(arg){
//     // arg.patches = arg.patches.filter(p=> ignore_patch(p));
//     // arg.inverse = arg.inverse.filter(p=> ignore_patch(p));
//     // // var save_patches = false;
//     // // //console.log(patches);
//     // // arg.patches.forEach(p=>{
//     // //     if(p.path[0]=='n'){
//     // //         if(p.path.length > 2){
//     // //             if(!ignored_node_props.includes(p.path[2])) save_patches = true;
//     // //         }else{
//     // //             save_patches = true;
//     // //         }
//     // //     }
//     // // });
//     // arg.patches.forEach(p=>{
//     //     if(p.op=='replace' && p.path.length==3 && p.path[2]=='deleted') save_patches = true;
//     // });
//     // arg.patches.forEach(p=>{
//     //     const path = p.path.join('.');
//     //     if(p.path.includes('pick')) save_patches = false;
//     //     if(path == 'design.mode') save_patches = false;
//     //     if(path == 'studio.mode') save_patches = false;
//     // });
//     // arg.patches.forEach(p=>{
//     //     if(p.op=='replace' && p.path.length==3 && p.path[2]=='deleted') save_patches = true;
//     // });
//     //if(save_patches){
//         //console.log('Commit Patches');
//         arg.send_updates_to_server(arg.state, arg.patches); // only send if saving patches for undo ?!?!?!
//         //console.log(arg.patches);
//         if(patches.length > patch){
//             patches.splice(patch, patches.length-patch);
//             inverse.splice(patch, inverse.length-patch);
//         }
//         // // const patches_extras = [];
//         // // const new_patches = arg.patches.map(p=>{ // replace add with deleted=false
//         // //     var result = p;
//         // //     if(p.op=='add' && p.path.length==2 && p.path[0]=='n'){//console.log('replace add with replace n.id.deleted=false');
//         // //         result = {
//         // //             op:'replace',
//         // //             path: [...p.path, 'drop'],
//         // //             value:false,
//         // //         };
//         // //         patches_extras.push({
//         // //             op:'replace',
//         // //             path: [...p.path, 'open'],
//         // //             value:true,
//         // //         });
//         // //     }
//         // //     //if(p.op=='add' && p.path.length==2 && p.path[0]=='n'){

//         // //     //}
//         // //     return result;
//         // // });
//         // // const inverse_extras = [];
//         // // const new_inverse = arg.inverse.map(p=>{ // replace remove with deleted=true
//         // //     var result = p;
//         // //     if(p.op=='remove' && p.path.length==2 && p.path[0]=='n'){//console.log('replace remove with replace n.id.deleted=true');
//         // //         result = {
//         // //             op:'replace',
//         // //             path: [...p.path, 'drop'],
//         // //             value:true,
//         // //         };
//         // //         inverse_extras.push({
//         // //             op:'replace',
//         // //             path: [...p.path, 'open'],
//         // //             value:false,
//         // //         });
//         // //     }
//         // //     return result;
//         // // });
//         // // patches.push([...new_patches, ...patches_extras]);
//         // // inverse.push([...new_inverse, ...inverse_extras]);
//         // // if(patches.length > 10){
//         // //     patches = patches.slice(patches.length-10);
//         // //     inverse = inverse.slice(inverse.length-10);
//         // // }
//         patches.push(arg.patches);
//         inverse.push(arg.inverse);
//         patch = patches.length;
//     //}
// }