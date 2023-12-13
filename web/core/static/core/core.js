import {produce, applyPatches, produceWithPatches, enablePatches, enableMapSet} from 'immer'; 
//import {create} from 'zustand';
import {createWithEqualityFn} from 'zustand/traditional'
import {subscribeWithSelector} from 'zustand/middleware';
import {shallow} from 'zustand/shallow';//'shallow';
import {createElement as c, useEffect, useState, useLayoutEffect} from 'react';
import {store} from './store/store.js';
//import {transient} from './transient/transient.js';
import {Vector2} from 'three';

export {gql_client} from './app.js';
export {use_query, use_mutation} from './app/gql.js';
export {Pickable} from './component/node/pickable.js';
export {View_Transform} from './component/node/base.js';
export {Button, Mode_Menu, Icon_Title, Svg} from './component/app/app.js';
export {pickable, draggable, droppable} from './app/pick.js';
export {icon} from './app/icon.js';
export {History} from './component/toolbar/history.js';
export {Make_Node} from './component/panel/make_node.js';
export {Make_Repo} from './component/panel/make_repo.js';
export {Inspect} from './component/panel/inspect.js';
export {Schema} from './component/panel/schema.js';

export const make_id = (length=16)=>{
    let result = '';
    Array.from({length}).some(() => {
        result += Math.random().toString(36).slice(2); // always hear that Math.random is not good for id generation
      return result.length >= length;
    });
    return result;
};
export const client = make_id();

enableMapSet();
enablePatches();
const core_store = createWithEqualityFn(subscribeWithSelector(() => store), shallow);
core_store.setState(d=>{  d.init(d); return d;  });
export const get_store = () => core_store.getState();
export function use_store(selector, a={}){
    if(a.subscribe){
        const args = {fireImmediately:true};
        //if(a.shallow) args.equalityFn = shallow;
        return useEffect(()=>core_store.subscribe(selector, a.subscribe, args), []);
    }
    //if(a.shallow) return core_store(selector, shallow);
    return core_store(selector);
}
//export const use_store_shallow = selector=> core_store(selector, shallow);
///////export const use_subscription  = (selector, callback, triggers=[])=> useEffect(()=>core_store.subscribe(selector, callback, {fireImmediately:true}), triggers);
////////export const subscribe_shallow = (selector, callback)=> useEffect(()=>core_store.subscribe(selector, callback, {fireImmediately:true,equalityFn:shallow}),[]);
//export const subS  = (selector, callback)=> core_store.subscribe(selector, callback, {fireImmediately:true});
//export const subSS = (selector, callback)=> core_store.subscribe(selector, callback, {fireImmediately:true, equalityFn:shallow});
//export const subSSI = (selector, callback)=> core_store.subscribe(selector, callback, {equalityFn:shallow,fireImmediately:true,});

export const pointer = {
    position: new Vector2(),
    start: new Vector2(),
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

let patch_index = 0;
let patches_history = [];
let inverse_history = [];
// var fork = null; // state fork for interactive stuff like dragging 
// var original_fork = null;



// set state without committing to history or server 
export const set_store = func => {
    //console.log('recieve state');
    //const result = next_state(get_store(), func); 
    // if(fork){
    //     fork = applyPatches(fork, result.patches);
    //     //original_fork = applyPatches(original_fork, result.patches);
    // }
    //var [nextState] = produceWithPatches(get_store(), d=>{ func(d) }); 
    //core_store.setState(nextState); 
    let next_state = produce(get_store(), d=>{ func(d) });
    core_store.setState(next_state); 
    return next_state;
};

export const commit_store = func => {
    var [state, new_patches, new_inverse] = produceWithPatches(get_store(), d=>{ func(d) }); 
    if(!new_patches.length){
        //console.log('no change');
        return;
    }
    core_store.setState(state); 
    if(patches_history.length > patch_index){
        patches_history.splice(patch_index, patches_history.length - patch_index);
        inverse_history.splice(patch_index, inverse_history.length - patch_index);
    }
    patches_history.push(new_patches);
    inverse_history.push(new_inverse);
    patch_index = patches_history.length;
    state.send_data(state, new_patches);
    //d.mutation.drop_node({variables:{team:repo_obj.team, repo}});
};


export function undo(){ 
    if(patch_index > 0){
        patch_index--;
        //console.log('Undo');
        //console.log(inverse_history[patch_index]);
        core_store.setState(d=>{
            let draft = applyPatches(d, inverse_history[patch_index]);
            draft.send_data(draft, inverse_history[patch_index]);
            // d = produce(d, d=>{
            //     d.cam_info = {...d.cam_info};
            //     d.studio.gizmo_active = false;
            //     d.design.update(d);
            //     d.inspect.update(d);
            //     d.graph.update(d);
            // });
            //console.log('undo!!!!', inverse_history[patch_index]);
            return draft;
        });
    }
}
export function redo(){ 
    if(patch_index < patches_history.length){
        //console.log('Redo');
        //console.log(patches_history[patch_index]);
        core_store.setState(d=>{
            let draft = applyPatches(d, patches_history[patch_index]);
            draft.send_data(draft, patches_history[patch_index]);
            // d = produce(d, d=>{
            //     d.cam_info = {...d.cam_info};
            //     d.studio.gizmo_active = false;
            //     d.design.update(d);
            //     d.inspect.update(d);
            //     d.graph.update(d);
            // });
            return draft;
        });
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

export function snake_case(s){
    return s.toLowerCase().replace(/ /g,'_');
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
//     core_store.setState(nextState); 
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
//         arg.state.send_data(arg.state, arg.patches); // only send if saving patches for undo ?!?!?!
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