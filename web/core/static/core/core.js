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
export * from './component/app/transform.js';
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

export const assess = (obj, args) => (typeof obj === 'function' ? obj(args) : obj); 

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
    return store(state => {
        current_draft = state; // TODO: check if can be removed
        return selector(state);
    });
}

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

function set_state(state, patches){
    store.setState(state); 
    send_patches_to_graph_app(patches);
}

export const set_store = (func, prep) => {
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
    if(!patches.length) return [state];
    set_state(state, patches);
    return [state, patches, inverse];
};

export const act_on_store = (func, prep) => {
    const [state, patches, inverse] = set_store(func, prep);
    if(!patches) return; 
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

function apply_patches(patches){
    const state = applyPatches(get_store(), patches);
    set_state(state, patches);
    send_updates_to_server(state, patches);
}

export const graph_app_url = `https://graph.delimit.art`;
const graph_app_element = document.getElementById('graph_app').contentWindow;

function is_patch_for_graph_app(path){
    if(path[0] == 'nodes'){
        return true; //if(is_formal_node_id(path[1])) return true;
    }else if(path[0] == 'scene' && path[1] == 'sources'){
        return true; //if(is_formal_node_id(path[2])) return true; // }else if(path[0] == 'to_graph_app'){//
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
    let state = get_store();
    patches = patches.map(({op, path, value}) => ({ // TODO: if a node doesn't exist, reset the scene tree!
        path: (path[0]==='nodes' && !is_formal_node_id(path[1])) ? path : null, //  && state.nodes.has(path[1])
        op, value,
    })).filter(patch => (patch.path != null));
    store.setState(state => applyPatches(state, patches)); 
}


export function undo(){ // skip/ignore patches that try to operate on dropped versions
    if(patch_index > 0){
        patch_index--;
        try{
            apply_patches(inverse_history[patch_index]);
        }catch{
            console.error('undo failed');
        }
    }
}
export function redo(){ 
    if(patch_index < patches_history.length){
        try{
            apply_patches(patches_history[patch_index]);
        }catch{
            console.error('redo failed');
        }
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