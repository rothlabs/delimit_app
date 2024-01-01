import * as THREE from 'three';
import {face} from './face.js';
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
    repo:   new Map(),
    node:   new Map(),
    commit: new Map(),
    studio:{
        mode: 'repo',
        repo: {},
        panel: {mode:'inspect'},
        cursor: '',
    },
    confirm:{},

    ...schema,
    ...theme,
    ...pick,
    ...make,
    ...drop,
    ...inspect,
    ...remake,
    face,
    design,
    graph,

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
        d.make.edge(d, {root:d.entry, term:'name', stem:{type:'xsd:string', value:'Entry'}});
        d.base_texture = new THREE.TextureLoader().load(
            d.static_url+'texture/uv_grid.jpg'//"https://threejs.org/examples/textures/uv_grid_opengl.jpg"
        );
        d.base_texture.wrapS = d.base_texture.wrapT = THREE.RepeatWrapping;
        d.base_texture.anisotropy = 16;
        d.theme.compute(d);
    },

    mutate:{
        leaf(d, root, term, index, value){
            //console.log(root, term);
            //console.log([...d.node.get(root).terms]);
            const leaf = d.node.get(root).terms.get(term)[index];
            let coerced = value;
            if(typeof coerced == 'boolean' && leaf.type == 'xsd:boolean'){
                leaf.value = coerced;
                return coerced;
            }
            if(typeof coerced == 'string'){
                if(leaf.type == 'xsd:string'){
                    leaf.value = coerced;
                    return coerced;
                }
                //coerced = coerced.replace(/^0+/, '');
                if(['', '-'].includes(coerced)){
                    leaf.value = 0;
                    return coerced;
                }
                if(leaf.type == 'xsd:integer'){
                    coerced = coerced.replace(/\./g, '');
                    if(!isNaN(coerced) && Number.isInteger(parseFloat(coerced))){
                        leaf.value = parseInt(coerced);
                        return coerced;
                    }
                }else if(leaf.type == 'xsd:decimal'){
                    if(['.', '-.'].includes(coerced)){
                        leaf.value = 0;
                        return coerced;
                    }
                    if(!isNaN(coerced)){
                        leaf.value = parseFloat(coerced);
                        return coerced;
                    }
                }
            }
        },
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
        for(const pth of d.iterable(path)){
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
        for(const pth of d.iterable(path)){
            try{
                const leaf = d.leaf(d, node, pth);
                if(leaf.type) return leaf.value;
            }catch{}
        }
        return alt;
    },
    stem(d, node, path, alt){
        for(const pth of d.iterable(path)){
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
        for(const pth of d.iterable(path)){
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
            const commit = d.node.get(node)?.commit;
            if(d.commit.has(commit)){
                const commit_obj = d.commit.get(commit);
                commit_obj.writable || d.repo.get(commit_obj.repo).writable;
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
    iterable(obj){ // rename to as_iterator ?! or iterable #1
        if(obj == null) return [];
        if(typeof obj === 'string') return [obj];
        if(typeof obj[Symbol.iterator] === 'function') return obj;
        return [obj];
    },

    send_data(d, patches){ 
        const make_nodes = new Map();
        const close_nodes = new Set();
        const drop_nodes = new Set();
        function handle_node({path, op}){
            console.log('patch', path, op);
            const node = path[1];
            if(d.node.has(node)){
                make_nodes.set(node, Object.fromEntries(d.node.get(node).terms)); 
            }else if(d.closed.node.has(node)){
                console.log('send close node');
                close_nodes.add(node);
            }else if(d.dropped.node.has(node) || path.length == 2){
                console.log('send drop node');
                drop_nodes.add(node);
            }
        }
        for(const patch of patches){ 
            if(patch.path[0] == 'node' && patch.path[2] != 'back') handle_node(patch);
        }
        if(make_nodes.size){
            const nodes = JSON.stringify(Object.fromEntries(make_nodes));
            console.log('push node', nodes);
            d.server.make_nodes({variables:{nodes}}); 
        }
        if(close_nodes.size){
            console.log('shut node', close_nodes);
            d.server.close_nodes({variables:{nodes:[...close_nodes]}});
        }
        if(drop_nodes.size){
            console.log('drop node', drop_nodes);
            d.server.drop_nodes({variables:{nodes:[...drop_nodes]}});
        }
    },

    receive_data:(d, data)=>{// change to receive patches directly from server    must check if this data has been processed already, use d.make.part, d.make.edge, etc!!!!!!
        //console.log(JSON.stringify(data));
        Object.entries(data.repos).map(([repo, {metadata:{name, story}, writable}])=>{ // writable
            d.repo.set(repo, {name, story, writable, commits:new Set()});
            d.dropped.repo.delete(repo);
            d.closed.repo.delete(repo);
        });
        Object.entries(data.commits).map(([commit, {top, repo, metadata:{name, story}, writable}])=>{
            d.commit.set(commit, {repo, name, story, writable, nodes:new Set()});
            d.repo.get(repo).commits.add(commit);
            d.dropped.commit.delete(commit);
            d.closed.commit.delete(commit);
            if(top) d.target.commit(d, commit);
        });
        const nodes = Object.entries(data.nodes);
        nodes.map(([node])=>{
            const commit = node.slice(0, 16);
            d.make.node(d, {node, commit, given:true});
        });
        nodes.map(([node, terms])=>{
            for(const [term, stems] of Object.entries(terms)){
                if(!stems.length) d.make.edge(d, {root:node, term, given:true}); // making empty term
                for(const stem of stems){
                    d.make.edge(d, {root:node, term, stem, given:true});
                    if(term == 'delimit_app'){
                        d.make.edge(d, {root:d.entry, term:'app', stem:node, given:true, single:true});
                    }
                }
            }
        });
        d.graph.increment(d);
    },

};


// if(op == 'add' || op == 'replace'){
//     if(d.node.has(node)){
//         make_nodes.set(node, Object.fromEntries(d.node.get(node).terms)); // push_node(d.node.get(node));
//     }
//     // }else if(path.length == 2){
//     //     console.log('undo send push node');
//     //     console.log(value);
//     //     //push_nodes.set(node, Object.fromEntries(value)); // push_node(value);
//     // }
// }else if(op == 'remove'){
//     if(d.closed.node.has(node)){
//         console.log('send close node');
//         close_nodes.add(node);
//     }else if(d.dropped.node.has(node) || path.length == 2){
//         console.log('send drop node');
//         drop_nodes.add(node);
//     }
// }