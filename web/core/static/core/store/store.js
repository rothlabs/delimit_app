import * as THREE from 'three';
import * as getters from './getters.js';
import * as schema from './schema.js';
import * as theme from './theme.js';
import * as scene from './scene.js';
import * as pick from './pick.js';
import * as graph from './graph.js';
import * as make from './make.js';
import * as drop from './drop.js';
import * as inspect from './inspect.js';
import * as remake from './remake.js';

const ctx = JSON.parse(document.getElementById('ctx').text);

export const core_store = {
    mode: ctx.entry,
    nodes:    new Map(),
    repos:    new Map(),
    versions: new Map(),
    context_nodes: new Set(),
    studio:{
        mode: 'repo',
        panel: {mode:'node_editor'},
        cursor: '',
    },
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
    set_store_from_server_changes(d, changes){
        Object.entries(changes.repos).map(entry => d.make.repo(d, entry));
        Object.entries(changes.versions).map(entry => d.make.version(d, entry));
        const nodes = Object.entries(changes.nodes);
        nodes.map(([node]) => {
            const version = node.slice(0, 16);
            d.make.node(d, {node, version, given:true});
        });
        nodes.map(([node, terms]) => {
            for(const [term, stems] of Object.entries(terms)){
                if(!stems.length) d.make.edge(d, {root:node, term, given:true}); 
                stems.map(stem => d.make.edge(d, {root:node, term, stem, given:true}));
            }
        });
        d.graph.increment(d);
    },
    add_or_remove_as_context_node(d, root){
        if(d.get.node.type_name(d, root) == 'Context') d.context_nodes.add(root);
        else d.context_nodes.delete(root);
    },
    node_case(d, root){
        if(!d.nodes.has(root)) return 'missing';
        const terms = d.nodes.get(root).terms;
        if(!terms.size) return 'empty';
        if(terms.size > 1 || !terms.has('leaf')) return 'node'; 
        const leaf = terms.get('leaf');
        if(leaf.length != 1) return 'node';
        if(leaf[0].type) return {name:'leaf', leaf:leaf[0]}; 
        return 'node';
    },
    term_case(d, root, term){
        if(!d.nodes.has(root)) return;
        const stems = d.nodes.get(root).terms.get(term);
        if(!stems) return;
        if(!stems.length) return 'empty';
        if(stems.length > 1) return 'term';
        if(stems[0].type) return {name:'leaf', leaf:stems[0]};
        return {name:'node', node:stems[0]};
    },
    leaf(d, node, path, alt){
        for(const pth of d.get_iterable(path)){
            try{
                for(const term of pth.split(' ')){
                    node = d.nodes.get(node).terms.get(term)[0];
                }
                if(node.type) return node; //.value;
                node = d.nodes.get(node).terms.get('leaf')[0];
                if(node.type) return node; // .value;
            }catch{}
        }
        return alt;
    },
    value(d, node, path, alt){ 
        for(const pth of d.get_iterable(path)){
            try{
                const leaf = d.leaf(d, node, pth);
                if(leaf.type) return leaf.value;
            }catch{}
        }
        return alt;
    },
    stem(d, node, path, alt){
        for(const pth of d.get_iterable(path)){
            try{
                for(const term of pth.split(' ')){
                    node = d.nodes.get(node).terms.get(term)[0];
                }
                return node;
            }catch{}
        }
        return alt;
    },
    stems(d, root, path){ // rename to path? (like terminusdb path query)
        const result = [];
        for(const pth of d.get_iterable(path)){
            const terms = pth.split(' ');
            const last_term = terms.at(-1);//terms.pop();
            function get_stems(root, terms){
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
                        if(d.nodes.has(stems[i])) get_stems(stems[i], [...terms]);
                    }
                }
            }
            get_stems(root, terms);
        }
        return result;
    },
    terms: function* (d, root, a={}){
        for(const [term, stems] of d.nodes.get(root).terms){
            for(let index = 0; index < stems.length; index++){
                const stem = stems[index];
                if(!stem.type || a.leaf) yield [term, stem, index];
            }
        }
    },
    back: function* (d, stem){
        for(const root of d.nodes.get(stem).back){
            for(const [term, stems] of d.nodes.get(root).terms){
                for(let index = 0; index < stems.length; index++){
                    if(stems[index] == stem) yield [root, term, index];
                }
            }
        }
    },
    writable(d, node){
        const node_is_writable = node =>{
            const version = d.nodes.get(node)?.version;
            if(d.versions.has(version)){
                const version_obj = d.versions.get(version);
                version_obj.writable || d.repos.get(version_obj.repo).writable;
            }
            return true;
        };
        if(typeof node[Symbol.iterator] === 'function'){//if(Array.isArray(node)){
            return [...node].filter(node=> node_is_writable(node));
        }
        return node_is_writable(node);
    },
    rnd(v, sigfigs=100){
        return Math.round((v + Number.EPSILON) * sigfigs) / sigfigs;
    },
    get_iterable(item){ 
        item = item.node ?? item.nodes ?? item.repo ?? item.repos ?? item.version ?? item.versions ?? item.scene ?? item.scenes ?? item;
        if(item == null) return [];
        if(typeof item === 'string') return [item];
        if(typeof item[Symbol.iterator] === 'function') return item;
        return [item];
    },
};



