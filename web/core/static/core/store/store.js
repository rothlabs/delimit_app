import * as THREE from 'three';
import * as getters from './getters.js';
import * as schema from './schema.js'; // '../../common/store/schema.js';
import * as theme from './theme.js';
import * as scene from './scene.js';
import * as pick from './pick.js';
import * as graph from './graph.js';
import * as make from './make.js';
import * as drop from './drop.js';
import * as inspect from './inspect.js';
import * as remake from './remake.js';
import {make_common_slice} from '../../common/store/store.js';

const ctx = JSON.parse(document.getElementById('ctx').text);

export const make_store = get_draft => ({
    ...make_common_slice(get_draft),
    nodes:    new Map(),
    repos:    new Map(),
    versions: new Map(),
    code_keys:     new Map(),
    context_nodes: new Set(),
    mode: ctx.entry,
    server: {},
    studio:{
        mode: 'repo',
        set_mode(d, mode){
            d.studio.mode = mode;
            if(mode == 'scene') d.scene.increment_sources(d);
        },
        panel: {mode:'node_editor'},
        cursor: '',
    },
    code_tick: 0,
    increment_code: draft => draft.code_tick++,
    // code: {
    //     tick: 0,
    //     increment: draft => draft.code.tick++,
    // },
    confirm: {},
    get: {...getters},
    ...schema,
    ...theme,
    ...pick,
    ...make,
    ...drop,
    ...inspect,
    ...remake,
    ...scene,
    ...graph,
    static_url: document.body.getAttribute('data-static-url') + 'core/',
    max_click_delta: 7,
    axis_colors: ['#ff3b30', '#27e858', '#4287f5'],
    point_size: 6,
    easel_size: 400,
    //cam_info: {matrix: new Matrix4(), dir: new Vector3()},
    user_id: 0,
    search: {depth:null, ids:null},
    
    init(d){
        d.base_texture = new THREE.TextureLoader().load(
            d.static_url+'texture/uv_grid.jpg'//"https://threejs.org/examples/textures/uv_grid_opengl.jpg"
        );
        d.base_texture.wrapS = d.base_texture.wrapT = THREE.RepeatWrapping;
        d.base_texture.anisotropy = 16;
        d.theme.compute(d);
    },
    update_from_server_data(d, data){
        Object.entries(data.repos).map(entry => d.make.repo(d, entry));
        Object.entries(data.versions).map(entry => d.make.version(d, entry));
        const nodes = Object.entries(data.nodes);
        nodes.map(([node]) => {
            const version = node.slice(0, 16);
            d.make.node({node, version, given:true});
        });
        nodes.map(([node, terms]) => {
            for(const [term, stems] of Object.entries(terms)){ 
                if(!stems.length) d.make.edge(d, {root:node, term, given:true}); 
                stems.map(stem => {
                    if(stem.length == 15) console.log('free node id as stem!', stem);
                    d.make.edge(d, {root:node, term, stem, given:true})
                });
            };
        });
        for(const [node, code_key] of Object.entries(data.code_keys)){ // console.log('got code key', node, code_key);
            d.code_keys.set(node, code_key);
        }
        d.graph.increment(d);
        d.scene.increment(d);
    },
    add_or_remove_as_context_node(d, id){
        if(d.get.node.type_name(d, id) == 'Context') d.context_nodes.add(id);
        else d.context_nodes.delete(id);
    },
    get_node_case(d, root){
        if(!d.nodes.has(root)) return 'missing';
        const terms = d.nodes.get(root).terms;
        if(!terms.size) return 'empty';
        if(terms.size > 1 || !terms.has('leaf')) return 'node'; 
        const leaf = terms.get('leaf');
        if(leaf.length != 1) return 'node';
        if(leaf[0].type) return {name:'leaf', leaf:leaf[0]}; 
        return 'node';
    },
    get_term_case(d, root, term){
        if(!d.nodes.has(root)) return;
        const stems = d.nodes.get(root).terms.get(term);
        if(!stems) return;
        if(!stems.length) return 'empty';
        if(stems.length > 1) return 'term';
        if(stems[0].type) return {name:'leaf', leaf:stems[0]};
        return {name:'node', node:stems[0]};
    },
    // get_values(d, {root, terms}){
    //     return Object.entries(terms).map(([term, alt]) => {
    //         return d.get_leaf({root, term, alt});
    //         //const root_or_value = d.get_leaf(d, {root, term, alt});
    //         //return d.get_leaf(d, {root:root_or_value, term, alt:root_or_value});
    //     });
    // },
    get_stems(d, {root, ...term_paths}){ 
        const result = [];
        for(const term_path of d.get_iterable(term_paths)){
            const terms = term_path.split(' ');
            const last_term = terms.at(-1);//terms.pop();
            function get_inner_stems(root, terms){
                const term = terms.shift();
                if(!d.nodes.has(root)) return;
                const stems = d.nodes.get(root).terms.get(term);
                if(!Array.isArray(stems)) return;
                if(term == last_term){
                    for(let i = 0; i < stems.length; i++){
                        if(stems[i].type || d.nodes.has(stems[i])) result.push(stems[i]);
                    }
                }else{
                    for(let i = 0; i < stems.length; i++){
                        if(d.nodes.has(stems[i])) get_inner_stems(stems[i], [...terms]);
                    }
                }
            }
            get_inner_stems(root, terms);
        }
        return result;
    },
    writable(d, node){
        const is_node_writable = node =>{
            const id = d.nodes.get(node)?.version;
            if(d.versions.has(id)){
                const version = d.versions.get(id);
                return (version.writable || d.repos.get(version.repo).writable);
            }
            return true;
        };
        if(typeof node[Symbol.iterator] === 'function'){//if(Array.isArray(node)){
            return [...node].filter(node=> is_node_writable(node));
        }
        return is_node_writable(node);
    },
    rnd(v, sigfigs=100){
        return Math.round((v + Number.EPSILON) * sigfigs) / sigfigs;
    },
});


    // get_back_edges: function* (d, stem){
    //     for(const root of d.nodes.get(stem).roots){
    //         for(const [term, stems] of d.nodes.get(root).terms){
    //             for(let index = 0; index < stems.length; index++){
    //                 if(stems[index] == stem) yield [root, term, index];
    //             }
    //         }
    //     }
    // },



    // get_leaf(d, node, term_path){
    //     for(const term of term_path.split(' ')){
    //         node = d.nodes.get(node).terms.get(term)[0];
    //     }
    //     if(node.type) return node; //.value;
    //     node = d.nodes.get(node).terms.get('leaf')[0];
    //     if(node.type) return node; // .value;
    // },
    // get_leaf(d, {root, alt, ...term_paths}){ 
    //     for(const terms of d.get_iterable(term_paths)){
    //         try{
    //             const leaf = d.get_leaf(d, root, terms);
    //             if(leaf.type) return leaf.value;
    //         }catch{}
    //     }
    //     return alt;
    // },

    // get_stem(d, {root, ...term_paths}){
    //     for(const term_path of d.get_iterable(term_paths)){ // term_paths.term ?? term_paths.terms
    //         try{
    //             for(const term of term_path.split(' ')){
    //                 root = d.nodes.get(root).terms.get(term)[0];
    //             }
    //             return root;
    //         }catch{}
    //     }
    // },

// get_iterable(i){ // ?? i.term ?? i.terms
    //     i = i.id ?? i.ids ?? i.node ?? i.nodes ?? i.root ?? i.roots ?? i.term ?? i.terms
    //         ?? i.repo ?? i.repos ?? i.version ?? i.versions ?? i.scene ?? i.scenes ?? i;
    //     if(i == null) return [];
    //     if(typeof i === 'string') return [i];
    //     if(typeof i[Symbol.iterator] === 'function') return i;
    //     return [i];
    // },

    // get_edges: function* (d, root, a={}){
    //     for(const [term, stems] of d.nodes.get(root).terms){
    //         for(let index = 0; index < stems.length; index++){
    //             const stem = stems[index];
    //             if(!stem.type || a.leaf) yield [term, stem, index];
    //         }
    //     }
    // },

// get_leaf(d, node, path){
//     for(const pth of d.get_iterable(path)){
//         try{
//             for(const term of pth.split(' ')){
//                 node = d.nodes.get(node).terms.get(term)[0];
//             }
//             if(node.type) return node; //.value;
//             node = d.nodes.get(node).terms.get('leaf')[0];
//             if(node.type) return node; // .value;
//         }catch{}
//     }
// },
