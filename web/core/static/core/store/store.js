import * as THREE from 'three';
import * as io from './io.js';
import * as getters from './getters.js';
import * as schema from './schema.js';
import * as theme from './theme.js';
import {design} from './design.js';
import * as pick from './pick.js';
import {graph} from './graph.js';
import * as make from './make.js';
import * as drop from './drop.js';
import * as inspect from './inspect.js';
import * as remake from './remake.js';

const ctx = JSON.parse(document.getElementById('ctx').text);

export const store = {
    mode: ctx.entry,
    node:    new Map(),
    repo:    new Map(),
    version: new Map(),
    studio:{
        mode: 'repo',
        repo: {},
        panel: {mode:'node_editor'},
        cursor: '',
    },
    confirm:{},

    ...io,
    ...schema,
    ...theme,
    ...pick,
    ...make,
    ...drop,
    ...inspect,
    ...remake,
    design,
    graph,
    
    get:{
        ...getters,
    },

    static_url: document.body.getAttribute('data-static-url') + 'core/',
    max_click_delta: 7,
    axis_colors: ['#ff3b30', '#27e858', '#4287f5'],
    point_size: 6,
    easel_size: 400,
    //cam_info: {matrix: new Matrix4(), dir: new Vector3()},
    scene: null,

    user_id: 0,
    search: {depth:null, ids:null},
    
    init(d){
        d.entry = d.make.node(d, {});
        d.make.edge(d, {root:d.entry, term:'name', stem:{type:'string',  value:'Entry'}}); 
        d.make.edge(d, {root:d.entry, term:'show', stem:{type:'boolean', value:false}});
        d.base_texture = new THREE.TextureLoader().load(
            d.static_url+'texture/uv_grid.jpg'//"https://threejs.org/examples/textures/uv_grid_opengl.jpg"
        );
        d.base_texture.wrapS = d.base_texture.wrapT = THREE.RepeatWrapping;
        d.base_texture.anisotropy = 16;
        d.theme.compute(d);
    },

    type_name(d, root){
        if(!root) return '';
        return d.value(d, root, ['type name', 'type'], '');
    },
    node_case(d, root){
        if(!d.node.has(root)) return 'missing';
        const terms = d.node.get(root).terms;
        if(!terms.size) return 'empty';
        if(terms.size > 1 || !terms.has('leaf')) return 'node'; 
        const leaf = terms.get('leaf');
        if(leaf.length != 1) return 'node';
        if(leaf[0].type) return {name:'leaf', leaf:leaf[0]}; 
        return 'node';
    },
    term_case(d, root, term){
        if(!d.node.has(root)) return;
        const stems = d.node.get(root).terms.get(term);
        if(!stems) return;
        if(!stems.length) return 'empty';
        if(stems.length > 1) return 'term';
        if(stems[0].type) return {name:'leaf', leaf:stems[0]};
        return {name:'node', node:stems[0]};
    },
    leaf(d, node, path, alt){
        for(const pth of d.make_iterator(path)){
            try{
                for(const term of pth.split(' ')){
                    node = d.node.get(node).terms.get(term)[0];
                }
                if(node.type) return node; //.value;
                node = d.node.get(node).terms.get('leaf')[0];
                if(node.type) return node; // .value;
            }catch{}
        }
        return alt;
    },
    value(d, node, path, alt){ 
        for(const pth of d.make_iterator(path)){
            try{
                const leaf = d.leaf(d, node, pth);
                if(leaf.type) return leaf.value;
            }catch{}
        }
        return alt;
    },
    stem(d, node, path, alt){
        for(const pth of d.make_iterator(path)){
            try{
                for(const term of pth.split(' ')){
                    node = d.node.get(node).terms.get(term)[0];
                }
                return node;
            }catch{}
        }
        return alt;
    },
    stems(d, root, path){ // rename to path? (like terminusdb path query)
        const result = [];
        for(const pth of d.make_iterator(path)){
            const terms = pth.split(' ');
            const last_term = terms.at(-1);//terms.pop();
            function get_stems(root, terms){
                const term = terms.shift();
                if(!d.node.has(root)) return;
                const stems = d.node.get(root).terms.get(term);
                if(!Array.isArray(stems)) return;
                if(term == last_term){
                    for(let i = 0; i < stems.length; i++){
                        if(stems[i].type || d.node.has(stems[i])) result.push(stems[i]);
                    }
                }else{
                    for(let i = 0; i < stems.length; i++){
                        if(d.node.has(stems[i])) get_stems(stems[i], [...terms]);
                    }
                }
            }
            get_stems(root, terms);
        }
        return result;
    },
    terms: function* (d, root, a={}){
        for(const [term, stems] of d.node.get(root).terms){
            for(let index = 0; index < stems.length; index++){
                const stem = stems[index];
                if(!stem.type || a.leaf) yield [term, stem, index];
            }
        }
    },
    back: function* (d, stem, a={}){
        for(const root of d.node.get(stem).back){
            for(const [term, stems] of d.node.get(root).terms){
                for(let index = 0; index < stems.length; index++){
                    if(stems[index] == stem) yield [root, term, index];
                }
            }
        }
    },
    writable(d, node){
        const node_is_writable = (node) =>{
            const version = d.node.get(node)?.version;
            if(d.version.has(version)){
                const version_obj = d.version.get(version);
                version_obj.writable || d.repo.get(version_obj.repo).writable;
            }
            return true;
        };
        if(Array.isArray(node)){
            return node.filter(node=> node_is_writable(node));
        }
        return node_is_writable(node);
    },
    rnd(v, sigfigs=100){
        return Math.round((v + Number.EPSILON) * sigfigs) / sigfigs;
    },
    make_iterator(item){ 
        item = item.node ?? item.nodes ?? item.repo ?? item.repos ?? item.version ?? item.versions ?? item;
        if(item == null) return [];
        if(typeof item === 'string') return [item];
        if(typeof item[Symbol.iterator] === 'function') return item;
        return [item];
    },
};

