import {produce, applyPatches, produceWithPatches, enablePatches, enableMapSet} from 'immer'; 
//import {create} from 'zustand';
import {createWithEqualityFn} from 'zustand/traditional'
import {subscribeWithSelector} from 'zustand/middleware';
import {shallow} from 'zustand/shallow';//'shallow';
import {createElement as c, useEffect, useState, useLayoutEffect} from 'react';
import {store} from './store/store.js';

export {gql_client} from './app.js';
export {use_query, use_mutation} from './gql.js';
export {Pickable} from './component/node/pickable.js';
export {View_Transform} from './component/node/base.js';
export {Svg, Svg_Button} from './component/app/base.js';

enableMapSet();
enablePatches();
const store_core = createWithEqualityFn(subscribeWithSelector(() => store), shallow);
store_core.setState(d=>{  d.init(d); return d;  });
export const get_store = () => store_core.getState();
export function use_store(selector, a={}){
    if(a.subscribe){
        const args = {fireImmediately:true};
        //if(a.shallow) args.equalityFn = shallow;
        return useEffect(()=>store_core.subscribe(selector, a.subscribe, args), []);
    }
    //if(a.shallow) return store_core(selector, shallow);
    return store_core(selector);
}
//export const use_store_shallow = selector=> store_core(selector, shallow);
export const use_subscription  = (selector, callback, triggers=[])=> useEffect(()=>store_core.subscribe(selector, callback, {fireImmediately:true}), triggers);
////////export const subscribe_shallow = (selector, callback)=> useEffect(()=>store_core.subscribe(selector, callback, {fireImmediately:true,equalityFn:shallow}),[]);
//export const subS  = (selector, callback)=> store_core.subscribe(selector, callback, {fireImmediately:true});
//export const subSS = (selector, callback)=> store_core.subscribe(selector, callback, {fireImmediately:true, equalityFn:shallow});
//export const subSSI = (selector, callback)=> store_core.subscribe(selector, callback, {equalityFn:shallow,fireImmediately:true,});

var patch = 0;
var patches = [];
var inverse = [];
var fork = null; // state fork for interactive stuff like dragging 
var original_fork = null;

function next_state(state, func){
    var all_patches = [];
    var all_inverse = [];
    var result = produceWithPatches(state, d=>{ func(d) }); //[d, patches, inverse_patches] d.next_funcs=[]; d.next_ids=[]; 
    while(result[1].length > 0){
        all_patches = [...all_patches, ...result[1]];
        all_inverse = [...result[2], ...all_inverse];
        result = produceWithPatches(result[0], d=>{ if(d) d.continue(d); }); //result = produceWithPatches(result[0], d=>{ d.continue(d) }); 
    }
    store_core.setState(result[0]); 
    return {state:result[0], patches:all_patches, inverse:all_inverse}; // rename state to d
}

function ignore_patch(p){
    const path = p.path.join('.');
    if(path == 'studio.panel') return false;
    if(path == 'studio.panel.show') return false;
    if(path == 'studio.panel.mode') return false;
    if(path == 'design.matrix') return false;
    if(path == 'design.act') return false; // 'design.moving'
    //if(path == 'graph.c_c') return false;
    if(path == 'studio.gizmo_active') return false; 
    //if(path == 'studio.cam_info') return false;
    //if(path == 'design.n') return false;
    //if(path == 'design.group') return false;
    
    //if(p.path.includes('pick')) return false;
    return true;
}
const ignored_node_props = ['repo', 'pick', 'hover', 'pos', 'c_c'];
function commit_state(arg){
    arg.patches = arg.patches.filter(p=> ignore_patch(p));
    arg.inverse = arg.inverse.filter(p=> ignore_patch(p));
    var save_patches = false;
    //console.log(patches);
    arg.patches.forEach(p=>{
        if(p.path[0]=='n'){
            if(p.path.length > 2){
                if(!ignored_node_props.includes(p.path[2])) save_patches = true;
            }else{
                save_patches = true;
            }
        }
    });
    // arg.patches.forEach(p=>{
    //     if(p.op=='replace' && p.path.length==3 && p.path[2]=='deleted') save_patches = true;
    // });
    // arg.patches.forEach(p=>{
    //     const path = p.path.join('.');
    //     if(p.path.includes('pick')) save_patches = false;
    //     if(path == 'design.mode') save_patches = false;
    //     if(path == 'studio.mode') save_patches = false;
    // });
    // arg.patches.forEach(p=>{
    //     if(p.op=='replace' && p.path.length==3 && p.path[2]=='deleted') save_patches = true;
    // });
    if(save_patches){
        //console.log('Commit Patches');
        arg.state.send(arg.state, arg.patches); // only send if saving patches for undo ?!?!?!
        //console.log(arg.patches);
        if(patches.length > patch){
            patches.splice(patch, patches.length-patch);
            inverse.splice(patch, inverse.length-patch);
        }
        const patches_extras = [];
        const new_patches = arg.patches.map(p=>{ // replace add with deleted=false
            var result = p;
            if(p.op=='add' && p.path.length==2 && p.path[0]=='n'){//console.log('replace add with replace n.id.deleted=false');
                result = {
                    op:'replace',
                    path: [...p.path, 'drop'],
                    value:false,
                };
                patches_extras.push({
                    op:'replace',
                    path: [...p.path, 'open'],
                    value:true,
                });
            }
            //if(p.op=='add' && p.path.length==2 && p.path[0]=='n'){

            //}
            return result;
        });
        const inverse_extras = [];
        const new_inverse = arg.inverse.map(p=>{ // replace remove with deleted=true
            var result = p;
            if(p.op=='remove' && p.path.length==2 && p.path[0]=='n'){//console.log('replace remove with replace n.id.deleted=true');
                result = {
                    op:'replace',
                    path: [...p.path, 'drop'],
                    value:true,
                };
                inverse_extras.push({
                    op:'replace',
                    path: [...p.path, 'open'],
                    value:false,
                });
            }
            return result;
        });
        patches.push([...new_patches, ...patches_extras]);
        inverse.push([...new_inverse, ...inverse_extras]);
        if(patches.length > 10){
            patches = patches.slice(patches.length-10);
            inverse = inverse.slice(inverse.length-10);
        }
        patch = patches.length;
    }
}

// set state without committing to history or server 
export const set_store = func => {
    //console.log('recieve state');
    const result = next_state(get_store(), func); 
    if(fork){
        fork = applyPatches(fork, result.patches);
        //original_fork = applyPatches(original_fork, result.patches);
    }
    return result.state;
};

// set state (rename to commit state?)
export const ss = func=> {
    //console.log('set state');
    //console.trace();
    commit_state(next_state(get_store(), func)); 
};

// fork state
export const fork_store = func=>{                 // this might be the secret sauce to async functions! #1
    //console.log('fork state');
    fork = next_state(get_store(), func).state;
    //original_fork = next_state(get_store(), func).state;;
}; 

// set fork
export const set_fork = func=>{
    //console.log('set fork');
    if(fork != null){
        next_state(fork, func);//.state;
        //fork = next_state(fork, func).state; 
    }else{
        console.log('TRIED TO SET STATE FORK THAT DOES NOT EXIST!');
        //assert(false, 'TRIED TO SET STATE FORK THAT DOES NOT EXIST!');
    }
    //next_state(fork, func);
}; 

// merge fork
export const merge_fork = func=>{ // watch out for no-change resulting in undefined d!?!?!
    if(fork != null){
        console.log('merge state!');
        commit_state(next_state(fork, func));
        //commit_state(next_state(original_fork, func));
        fork = null;
    }else{
        console.log('TRIED TO MERGE STATE FORK THAT DOES NOT EXIST!');
        //assert(false, 'TRIED TO MERGE STATE FORK THAT DOES NOT EXIST!');
    }
}; 


export function undo(){ 
    if(patch > 0){
        patch--;
        //console.log('Undo');
        //console.log(inverse[patch]);
        store_core.setState(d=>{
            var d = applyPatches(d, inverse[patch]);
            d.send(d, inverse[patch]);
            d = produce(d, d=>{
                d.cam_info = {...d.cam_info};
                d.studio.gizmo_active = false;
                d.design.update(d);
                d.inspect.update(d);
                d.graph.update(d);
            });
            return d;
        });
    }
}
export function redo(){ 
    if(patch < patches.length){
        //console.log('Redo');
        //console.log(patches[patch]);
        store_core.setState(d=>{
            var d = applyPatches(d, patches[patch]);
            d.send(d, patches[patch]);
            d = produce(d, d=>{
                d.cam_info = {...d.cam_info};
                d.studio.gizmo_active = false;
                d.design.update(d);
                d.inspect.update(d);
                d.graph.update(d);
            });
            return d;
        });
        patch++;
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

export function snake_case(s){
    return s.toLowerCase().replace(/ /g,'_');
}