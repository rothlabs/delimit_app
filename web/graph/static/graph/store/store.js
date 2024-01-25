import * as make from './make.js';
import * as drop from './drop.js';
import * as scene from './scene.js';
import {static_url, make_common_slice} from 'delimit/graph';
//import {make_common_slice} from 'delimit/common';

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

