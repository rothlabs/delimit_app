//import {get_draft} from 'delimit/graph';
import * as make from './make.js';
import * as drop from './drop.js';
import * as scene from './scene.js';
import {make_common_slice} from '../../common/store/store.js';

export const make_store = get_draft => ({
    ...make_common_slice(get_draft),
    ...make,
    ...drop,
    ...scene,
    nodes: new Map(),
    code_keys: new Map(),
    static_url: document.body.getAttribute('data-static-url') + 'graph/',
    scene:{
        sources: new Map(),
    },
});

