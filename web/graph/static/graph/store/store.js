import * as make from './make.js';
import * as drop from './drop.js';
import * as scene from './scene.js';
import {static_url, make_common_slice} from 'delimit/graph';

export const make_store = get_draft => ({
    ...make_common_slice(get_draft),
    ...make,
    ...drop,
    ...scene,
    nodes: new Map(),
    base_url: static_url + 'graph/',
    scene:{
        sources: new Map(),
    },
    code_keys: new Map(),
    tick: 0,
    pattern_match: {},
    query({name, args={}, draft=get_draft(), ...target}){
        const [_, node] = Object.entries(target)[0];
        if(typeof node === 'string'){
            return execute_querier({node, name, args, draft});
        } 
        return draft.get_iterable(target).map(node => execute_querier({node, name, args, draft})).filter(v => v);
    },
});


function execute_querier({node, name, args, draft}){
    const code = draft.get_stem({root:node, terms:'type code'});
    const querier = draft.nodes.get(code)?.queriers?.get(name);
    if(querier) return querier.execute({node, ...args}); // , caller:'local'
}


    // cache: new Map(),
    // //axiom: {},
    // memoize({func, draft=get_draft()}){
    //     //const cache = new Map();
    //     draft.cache.set(func.name, new Map());
    //     //console.log(func.name);
    //     return function(...args){
    //         const key = stringify(args);
    //         const func_cache = get_draft().cache.get(func.name);
            
    //         //console.log(func_cache.keys());
    //         //if(cache.has(func)){
    //         if(func_cache.has(key)) {
    //             console.log('returning cache!!!!!!!!!!!');
    //             return func_cache.get(key);
    //         }
    //         //}
    //         if(func_cache.size > 50){
    //             func_cache.delete(func_cache.keys().next().value);
    //             //console.log('deleted old cache');
    //         }
    //         //console.log('mark 0');
    //         const result = func.apply(this, args);
    //         //console.log('mark 1');
    //         set_store(d=> d.cache.get(func.name).set(key, result));
    //         //console.log('last!!', func_cache);
    //         return result;
    //     };
    // },