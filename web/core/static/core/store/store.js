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
import {make_common_slice, static_url} from 'delimit';
//import {navigate} from 'react-router-dom';

const ctx = JSON.parse(document.getElementById('ctx').text);

export const make_store = get_draft => ({
    ...make_common_slice(get_draft),
    nodes:    new Map(),
    repos:    new Map(),
    versions: new Map(),
    code_keys:     new Map(),
    context_nodes: new Set(),
    server: {},
    mode: ctx.entry,
    // set_mode({mode, navigate, draft = get_draft()}){
    //     draft.mode = mode;
    //     if(mode == 'studio' && draft.studio.mode == 'scene') d.scene.increment_sources(d);
    //     navigate('/'+mode);
    // },
    studio:{
        mode: 'repo',
        set_mode(d, mode){
            d.studio.mode = mode;
            if(mode == 'scene') d.scene.increment_sources(d);
        },
        panel: {mode:'node_editor'},
        cursor: '',
    },
    blog:{
        mode: 'browse',
        set_mode(mode, draft=get_draft()){
            draft.blog.mode = mode;
        },
    },
    tick: 0, // drag_tick?
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
    base_url: static_url + 'core/',
    max_click_delta: 7,
    axis_colors: ['#ff3b30', '#27e858', '#4287f5'],
    point_size: 6,
    easel_size: 400,
    //cam_info: {matrix: new Matrix4(), dir: new Vector3()},
    user_id: 0,
    search: {depth:null, ids:null},
    camera: null,
    
    init(d){
        d.base_texture = new THREE.TextureLoader().load(
            d.base_url+'texture/uv_grid.jpg'//"https://threejs.org/examples/textures/uv_grid_opengl.jpg"
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
                for(const stem of stems){//stems.map(stem => {
                    d.make.edge(d, {root:node, term, stem, given:true});
                };
            };
        });
        for(const [node, code_key] of Object.entries(data.code_keys)){ // console.log('got code key', node, code_key);
            d.code_keys.set(node, code_key);
        }
        d.graph.increment(d);
        d.scene.increment(d);
    },
    add_or_remove_as_context_node(d, id){
        if(d.get_type_name(id) == 'Context') d.context_nodes.add(id);
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
    writable(d, node){
        //if(!node) return false;
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
