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
    code_tick: 0,
    //pending_queries: new Map(),
});

