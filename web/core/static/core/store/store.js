import {current} from 'immer';
import {Vector3, Matrix4} from 'three';
import * as THREE from 'three';
//import {static_url} from '../app.js';
//import lodash from 'lodash';
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
import {client} from 'delimit';

//console.log(theme);

const ctx = JSON.parse(document.getElementById('ctx').text);

// var next_funcs = [];
// var next_ids = [];


export const store = {//export const create_base_slice = (set,get)=>({
    mode: ctx.entry,
    //team: new Map(),
    repo:   new Map(),
    commit: new Map(),
    node:   new Map(),
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
            //console.log([...d.node.get(root).forw]);
            const leaf = d.node.get(root).forw.get(term)[index];
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

    // first(set_or_map){
    //     return set_or_map.keys().next().value;
    // },

    // leaf_term(d, root, term){
    //     try{
    //         const stems = d.node.get(root).forw.get(term);
    //         if(stems.length != 1) return;
    //         if(stems[0].type) return stems[0];
    //     }catch{}
    // },
    // leaf_node_term(d, root, term){
    //     try{
    //         const stems = d.node.get(root).forw.get(term);
    //         if(stems.length != 1) return;
    //         if(d.node_style(d, stems[0]) != 'leaf') return;
    //         return stems[0];//{root:stems[0], leaf:d.leaf_node(d, stems[0])};
    //     }catch{}
    // },
    type_name(d, root){
        if(!root) return '';
        return d.value(d, root, ['type name', 'type'], '');
    },
    node_case(d, root){
        if(!d.node.has(root)) return 'missing';
        const forw = d.node.get(root).forw;
        if(!forw.size) return 'empty';
        if(forw.size > 1 || !forw.has('leaf')) return 'node'; 
        const leaf = forw.get('leaf');
        if(leaf.length != 1) return 'node';
        if(leaf[0].type) return {name:'leaf', leaf:leaf[0]}; 
        return 'node';
    },
    term_case(d, root, term){
        if(!d.node.has(root)) return;
        const stems = d.node.get(root).forw.get(term);
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
                    node = d.node.get(node).forw.get(term)[0];
                }
                if(node.type) return node; //.value;
                node = d.node.get(node).forw.get('leaf')[0];
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
                    node = d.node.get(node).forw.get(term)[0];
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
                const stems = d.node.get(root).forw.get(term);
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
    forw: function* (d, root, a={}){
        for(const [term, stems] of d.node.get(root).forw){
            for(let index = 0; index < stems.length; index++){
                const stem = stems[index];
                if(!stem.type || a.leaf) yield [term, stem, index];
            }
        }
    },
    back: function* (d, stem, a={}){
        for(const root of d.node.get(stem).back){
            for(const [term, stems] of d.node.get(root).forw){
                for(let index = 0; index < stems.length; index++){
                    if(stems[index] == stem) yield [root, term, index];
                }
            }
        }
    },
    writable(d, node){
        if(Array.isArray(node)){
            return node.filter(node=> {
                //console.log(node, node.repo);
                const commit = d.node.get(node)?.commit;
                if(d.commit.has(commit)) return d.commit.get(commit).writable;
                return true;
            });
        }
        const commit = d.node.get(node)?.commit;
        if(d.commit.has(commit)) return d.commit.get(commit).writable;
        return true;
    },

    rnd(v, sigfigs=100){
        return Math.round((v + Number.EPSILON) * sigfigs) / sigfigs;
    },
    iterable(obj){ // rename to as_iterator ?! or iterable #1
        if(obj == null) return [];
        if(typeof obj === 'string') return [obj];
        if(typeof obj[Symbol.iterator] === 'function') return obj;
        return [obj];
        //return obj ? (Array.isArray(obj) ? obj : [obj]) : [];
    },

    send_data(d, patches){ // change to send patches directly to server (filtering for patches that matter)
        //console.log('patches', patches);
        const make_nodes = new Map();
        const close_nodes = new Set();
        const drop_nodes = new Set();
        function handle_node({path, op, value}){
            console.log('patch', path, op);
            const node = path[1];
            // function push_node(node_obj){
            //     const commit = node_obj.commit;
            //     if(!d.commit.has(commit)) return;
            //     if(!push.has(commit)) push.set(commit, {node:new Set(), forw:new Set()});
            //     const commit_push = push.get(commit);
            //     if(commit_push.node.size < commit_push.node.add(node).size){
            //         commit_push.forw.add(JSON.stringify(Object.fromEntries(node_obj.forw)));
            //     }
            // }
            // function drop_node(commit){
            //     if(!d.commit.has(commit)) return;
            //     if(!drop.has(commit)) drop.set(commit, new Set());
            //     drop.get(commit).add(node);
            // }
            if(op == 'add' || op == 'replace'){
                if(d.node.has(node)){
                    console.log('send push node');
                    make_nodes.set(node, Object.fromEntries(d.node.get(node).forw)); // push_node(d.node.get(node));
                }else if(path.length == 2){
                    console.log('undo send push node');
                    console.log(value);
                    //push_nodes.set(node, Object.fromEntries(value)); // push_node(value);
                }
            }else if(op == 'remove'){
                if(d.closed.node.has(node)){
                    console.log('send close node');
                    close_nodes.add(node);
                    // const commit = d.closed.node.get(node);
                    // if(!d.commit.has(commit)) return;
                    // if(!shut.has(commit)) shut.set(commit, new Set());
                    // shut.get(commit).add(node);
                }else if(d.dropped.node.has(node) || path.length == 2){
                    console.log('send drop node');
                    drop_nodes.add(node);// drop_node(d.dropped.node.get(node));
                }
                // }else if(path.length == 2){
                //     console.log('undo send drop node');
                //     drop_node(d.node.get(node).commit);
                // }
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
        nodes.map(([node, forw])=>{
            for(const [term, stems] of Object.entries(forw)){
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

};//);



        // //const nodes = new Set();
        // for(const triple of data.node){
        //     //if(nodes.has(triple.node)) console.log('duplicate!!!!');
        //     //nodes.add(triple.node);
        //     d.make.node(d, {repo, node:triple.node, given:true});
        // }
        // for(const triple of data.node){
        //     const node = triple.node;
        //     const obj = JSON.parse(triple.obj['@value']) //console.log(obj)
        //     for(const [term, stems] of Object.entries(obj)){
        //         if(!stems.length) d.make.edge(d, {root:node, term, given:true}); // making empty term
        //         for(const stem of stems){
        //             d.make.edge(d, {root:node, term, stem, given:true});
        //             if(term == 'delimit_app'){
        //                 d.make.edge(d, {root:d.entry, term:'app', stem:node, given:true, single:true});
        //             }
        //         }
        //     }
        // }


// d.repo.set(repo, {
//     name: data.repo.name,
//     story: data.repo.story,
//     write_access: data.repo.write_access,
//     node: d.repo.get(repo)?.node ?? new Set(),
// });



            // if(d.node.has(node)){
            //     console.log('send push node');
            //     //const repo = d.node.get(node).repo;
            //     push_node(d.node.get(node));
            //     // if(!d.repo.has(repo)) return;
            //     // if(!push.has(repo)) push.set(repo, {node:new Set(), forw:new Set()});
            //     // const repo_push = push.get(repo);
            //     // if(repo_push.node.size < repo_push.node.add(node).size){
            //     //     repo_push.forw.add(JSON.stringify(Object.fromEntries(d.node.get(node).forw)));
            //     // }
            // }else if(d.closed.node.has(node)){
            //     console.log('send close node');
            //     const repo = d.closed.node.get(node);
            //     if(!d.repo.has(repo)) return;
            //     if(!shut.has(repo)) shut.set(repo, new Set());
            //     shut.get(repo).add(node);
            // }else if(d.dropped.node.has(node)){
            //     console.log('send drop node');
            //     drop_node(d.dropped.node.get(node));
            //     // const repo = d.dropped.node.get(node);
            //     // if(!d.repo.has(repo)) return;
            //     // if(!drop.has(repo)) drop.set(repo, new Set());
            //     // drop.get(repo).add(node);
            // }else if(op == 'add' && path.length == 2){
            //     console.log('undo send push node');
            //     push_node(value);
            //     //const repo = value.repo;
            //     // if(!d.repo.has(repo)) return;
            //     // if(!push.has(repo)) push.set(repo, {node:new Set(), forw:new Set()});
            //     // const repo_push = push.get(repo);
            //     // if(repo_push.node.size < repo_push.node.add(node).size){
            //     //     repo_push.forw.add(JSON.stringify(Object.fromEntries(value.forw)));
            //     // }
            // }else if(path.length == 2 && op == 'remove'){
            //     console.log('undo send drop node');
            //     drop_node(d.node.get(node).repo);
            //     // const repo = d.node.get(node).repo;
            //     // if(!d.repo.has(repo)) return;
            //     // if(!drop.has(repo)) drop.set(repo, new Set());
            //     // drop.get(repo).add(node);
            // }


// for(const [repo, obj] of repos.entries()){
//     for(const root of obj.push){
//         for(let [term, stem] of d.forw(d, root, {leaf:true})){
//             if(stem.type) stem = {'@type':stem.type, '@value':stem.value};
//             obj.triples.push({root, term, stem}); // '@schema:':
//         }
//     }
//     if(obj.push.size) d.mutation.push_node({variables:{repo, triples:obj.triples}});
//     if(obj.shut.size) d.mutation.shut_node({variables:{repo, nodes:[...obj.shut]}});
//     if(obj.drop.size) d.mutation.drop_node({variables:{repo, nodes:[...obj.drop]}});
// }



    // // next(...a){ // static
    // //     const d = get();
    // //     const id = a.filter(a=>!Array.isArray(a)).map(a=>String(a)).join('_'); //check if one of a is an object and iterate that to stringify parts //must make sure this is stringifying function args right {key:value}?!?!?!
    // //     if(d.add(next_ids, id)){// add every func and then use set method to make entries unique  //JSON.stringify(a).split('').sort().join()
    // //         //console.log(id);
    // //         //console.log(id, get().n[a[1]] ? get().n[a[1]].t : 'unknown');
    // //         next_funcs.push({a:a, id:id});
    // //     }//else{
    // //     //     if(Array.isArray(a.at(-1))){
    // //     //         const f = next_funcs.find(f=>(f.id==id));
    // //     //         if(Array.isArray(f.a.at(-1))){
    // //     //             //const d = get();
    // //     //             a.at(-1).forEach(cumulative=>{
    // //     //                 d.add(f.a[f.a.length-1], cumulative);
    // //     //             });
    // //     //         }
    // //     //     }
    // //     // }
    // // },
    // // continue(d){
    // //     //console.log(current(d).next_funcs);
    // //     const funcs = [...next_funcs];
    // //     next_funcs = [];//d.empty_list;
    // //     next_ids = [];//d.empty_list;
    // //     //console.log(current(d).empty_list);
    // //     //console.log(funcs);
    // //     funcs.forEach(f=>{
    // //         //console.log(current(a));
    // //         lodash.get(d, f.a[0])(d, ...f.a.slice(1));
    // //     });// 0   1
    // // },



        // const nodes = [];
        // patches.forEach(patch=>{ // top level patch.path[0]=='n' ?
        //     if(patch.path[0]=='n'){
        //         const n = patch.path[1];
        //         if(patch.op == 'add'){ 
        //             if(patch.path.length == 2){ // node created  if(patch.path[0]=='n' && patch.path.length < 3){
        //                 d.add(nodes, n);
        //             }else if(patch.path[2] == 'n'){ // stem added
        //                 d.add(nodes, n);
        //             }
        //         }else if(patch.op == 'replace'){ 
        //             if(patch.path[2]=='n'){ // stems replaced
        //                 d.add(nodes, n);
        //             }else if(patch.path[2]=='v'){ // terminal value changed
        //                 d.add(nodes, n);
        //             }else if(patch.path[2]=='drop'){
        //                 d.add(nodes, n);
        //             }
        //         }else if(patch.op == 'remove'){
        //             if(patch.path[2]=='n'){
        //                 d.add(nodes, n);
        //             }
        //         }
        //     }
        // });
        // const triples = [];
        // for(const n of nodes){
        //     //if(d.admin_classes.includes(d.n[n].t)) continue; // rename to system_classes #1
        //     const cls = upper(d.n[n].t);
        //     triples.push({root:n, tag:'class', stem:cls}); // stem:'@schema:'+cls});
        //     triples.push({root:n, tag:'tag:drop', stem:d.n[n].drop});//stem:{'@type':'xsd:boolean', '@value':d.n[n].drop}});
        //     if(d.terminal_classes[d.n[n].t]){
        //         triples.push({root:n, tag:'tag:value', stem:d.n[n].v});//stem:{'@type':'xsd:'+d.n[n].t, '@value':d.n[n].v}});
        //     }else{
        //         d.graph.for_stem(d, n, (r,nn,t)=>{
        //             triples.push({root:n, tag:'tag:'+t, stem:nn}); //  triples.push({root:n, tag:'@schema:'+t, stem:nn});
        //         });
        //     }
        // }
        // if(triples.length){
        //     d.push_pack({variables:{triples:JSON.stringify({list:triples})}});
        // }



// if(patch.path.length == 2){
//     if(action == 'close') repo_obj.nodes.add(node);
//     // if(patch.op == 'add') repo_obj.nodes.add(node);
//     // if(patch.op == 'remove'){
//     //     if(d.dropped.has(node)) repo_obj.drops.add(node);
//     //     else                    repo_obj.shuts.add(node);
//     // }
//     continue;
// }
// if(patch.path[2] != 'forw') continue;
// // if(patch.op == 'replace' && patch.path[5] == 'value'){
// //     const term  = patch.path[3];
// //     const index = patch.path[4];
// //     const type  = d.node.get(root).forw.get(term)[index].type;
// //     const stem  = {'@type':type, '@value':patch.value};
// //     repo_obj.quads.push({root, '@schema:':term, stem, index});
// //     continue;
// // }
// repo_obj.nodes.add(node);



// const forw = d.node.get(root).forw;
// if(forw.size != 1) return false; // should allow more. what matters is that it is looking for a leaf term leading to a leaf #1
// const node = forw.get('leaf')[0];
// if(node.type) return node;


// stems(d, node, path, alt){ // rename to stems?
//     try{
//         const terms = path.split(' ');
//         const last_term = terms.pop();
//         for(const term of terms){
//             node = d.node.get(node).forw.get(term)[0];
//         }
//         const result = d.node.get(node).forw.get(last_term); 
//         if(result != null) return result;
//     }catch{}
//     return alt;
// },



    // add(array, item){ // static upgrade to do deep compare to find same object ?!?!?!?!
    //     if(array.indexOf(item) === -1){
    //         array.push(item);
    //         return true;
    //     }
    //     return false;
    // },
    // pop(array, item){ // static
    //     const index = array.indexOf(item);
    //     if(index !== -1) array.splice(index, 1);
    //     return index;
    // },
    // add_nc(array, item){ // item in the form of {n:n, c:c}
    //     const target = array.find(v=> v.n==item.n);
    //     if(target) target.c = item.c;
    //     else array.push(item);
    // },
    // pop_nc(array, item){
    //     const target = array.find(v=> v.n==item.n);
    //     if(target){
    //         array.splice(array.indexOf(target), 1);
    //         return true;
    //     }
    //     return false;
    // },
    // // for(arg, func){ // need ability to break !!!!!!
    // //     if(arg != undefined){
    // //         if(Array.isArray(arg)){arg.forEach((a,i)=> func(a,i))}
    // //         else                  {func(arg,0)}
    // //     }
    // // },




                // if(!s['@type']){
                //     d.make.edge(d, r, t, s, {received:true});//s = s['@value'];//{type:s['@class'], leaf:s['@value']};
                // }


        // const iter = {};
        // iter[Symbol.iterator] = ()=>{
        //     const entries = d.node.get(root).forw.entries();
        //     let {value, done} = entries.next();
        //     let indx = -1;
        //     return{
        //         next(){
        //             if(done) return {done};
        //             indx++;
        //             if(indx < value[1].length){
        //                 return {value:[value[0], value[1][indx], indx]};	
        //             }
        //             ({value, done} = entries.next());
        //             if(done) return {done};
        //             indx = 0;
        //             return {value:[value[0], value[1][indx], indx]};	
        //         }
        //     };
        // };




    //terminal_classes: Object.fromEntries(['boolean', 'integer', 'decimal', 'string'].map(t=>[t,true])),
    //asset_classes: [],
    //admin_classes: [],

    //terminal_tags: [],

    //root_terms:    {'view':'viewer', 'asset':'owner'},
    // stem_tags:    [],
    // boolean_tags: [],
    // integer_tags: [],
    // decimal_tags: [],
    // string_tags:  [],
    // enum: {},




                //d.drop.edge(d, {root:r}); // root term stem
                
                // if(d.node.has(n)){
                //     d.drop.edge(d, {root:n})
                //     //for(const edge in d.graph.edge(d, {root:n})) d.drop.edge(d, {edge});
                //     //d.graph.drop_stems(d, n); // d.graph.for_edge(d, n, (r,n,t)=> d.delete.edge(d, r, t, n)); // rename to for_edge or for_triple
                // }else{
                //     d.make.node(d, {node:n}); // d.n[n] = d.node_template(d, 'node');
                // }
                // d.n[n].n = {};
                // d.pick.color(d, n);
            //}
            




// close: (d, nodes)=>{ /// need to integrate into post update system!!!! (broken, will not work right)
//     const close_pack = {p:[], b:[], i:[], f:[], s:[]};
//     nodes.forEach(n=>{
//         d.graph.close(d, n);
//         close_pack[d.n[n].m].push(n);
//         // d.n[n].open=false;
//         // d.n[n].r = {};
//         // d.n[n].c = {};
//         // d.n[n].t = '';
//         // if(d.n[n].m=='p'){  d.n[n].n = {};  }
//         // else{  d.n[n].v = null;  }
//     });
//     d.close_pack({variables:close_pack});
// },




        // for (const [t, n] of Object.entries(d.node)) {
        //     if(n.subject) d.add(d.asset_classes, t);
        //     d.add(d.stem_tags, t);
        //     if(n.stem) for(const t of n.stem) d.add(d.stem_tags, t);
        //     if(n.bool) for(const t of Object.keys(n.bool)) d.add(d.boolean_tags, t);
        //     if(n.int) for(const t of Object.keys(n.int)) d.add(d.integer_tags, t);
        //     if(n.float) for(const t of Object.keys(n.float)) d.add(d.decimal_tags, t);
        //     if(n.string) for(const t of Object.keys(n.string)) d.add(d.string_tags, t);
        //     if(n.common_bool) for(const t of Object.keys(n.common_bool)) d.add(d.boolean_tags, t);
        //     if(n.common_int) for(const t of Object.keys(n.common_int)) d.add(d.integer_tags, t);
        //     if(n.common_float) for(const t of Object.keys(n.common_float)) d.add(d.decimal_tags, t);
        //     if(n.common_string) for(const t of Object.keys(n.common_string)) d.add(d.string_tags, t);
        // }
        // d.terminal_tags = [...d.boolean_tags, ...d.integer_tags, ...d.decimal_tags, ...d.string_tags];
        // d.node_classes = [...d.asset_classes, ...d.admin_classes];

        //d.node.init(d);
        //d.make.init(d);
        //d.graph.init(d); //d.node.init(d);


// node_css:{
    //     'public':         'bi-globe-americas',
    //     'user':        'bi-person',
    //     'boolean':         'bi-123', 
    //     'integer':        'bi-123',
    //     'decimal':        'bi-123',
    //     'string':           'bi-type',
    //     'point':          'bi-record-circle',
    //     'curve':          'bi-bezier2',
    //     'ellipse':        'bi-circle',
    //     'sketch':         'bi-easel2',
    //     //'group':          'bi-box-seam',
    //     'transform':      'bi-arrows-move',
    //     'top_view':       'bi-camera-reels',
    //     'side_view':      'bi-camera-reels',
    //     'face_camera':    'bi-camera-reels',
    //     'auxiliary':      'bi-binoculars',
    //     'manual_compute': 'bi-cpu',
    //     'product':        'bi-bag',
    //     'surface':        'bi-map',
    //     'shape':          'bi-pentagon',
    //     'layer':          'bi-layers',
    //     'image':          'bi-image',
    //     'slice':          'bi-rainbow',
    //     'fill':           'bi-cloud-fog2-fill',
    //     'corner':         'bi-triangle',
    //     'post':           'bi-code',
    //     'brush':          'bi-brush',
    //     'stroke':         'bi-slash-lg',
    //     'machine':        'bi-device-ssd',
    //     'mix':            'bi-bezier',
    //     'guide':          'bi-bezier2',
    // },


    // // receive: (d, pack)=>{// change to receive patches directly from server    must check if this data has been processed already, use d.make.part, d.make.edge, etc!!!!!!
    // //     try{
    // //         console.log(pack);
    // //         pack = JSON.parse(pack);
    // //         console.log(pack);
    // //     }catch(e){
    // //         console.log('base.receive Error', e);
    // //     }
        

    // //     var set_update_graph = false;
    // //     if(data.t){
    // //         d.t = Object.fromEntries(data.t.map(t=> [t.id, t.v]));
    // //         d.t_id = Object.fromEntries(data.t.map(t=> [t.v, t.id]));
    // //     }
    // //     ['p','b','i','f','s'].forEach(m=>{
    // //         data[m].forEach(n=>{
    // //             if(!d.n[n.id]){
    // //                 d.n[n.id] = {
    // //                     m: m,
    // //                     pick: {pick:false, hover:false},
    // //                     graph: { // put in d.graph.node.vectors
    // //                         pos: new Vector3(), //random_vector({min:window_size, max:window_size*1.5, z:0}),
    // //                         //dir: new Vector3(),
    // //                         vis: true,
    // //                         //lvl: 0,
    // //                     },
    // //                     pin: {},
    // //                     design: { vis:true },
    // //                 };
    // //                 d.pick.color(d,n.id);
    // //             }
    // //             //if(n.id == 'tuXEbqsYYX8CdIPM') console.log('public!')
    // //             //if(d.graph.ex(d,n.id)){ // is this stopping undo delete from other client?!?!?!
    // //             if(d.n[n.id].r){
    // //                 //const edges = []; 
    // //                 d.graph.for_root_stem(d, n.id, (r,n,t)=> d.delete.edge(d,r,n,{t:t})); //, no_update:true
    // //                     //edges.push({r:r, n:n, t:t}); // // , o:o don't know if this is needed ?!?!?!?!,  this will cause reverse edges to be deleted on forward node
    // //                 //});
    // //                 //d.node.delete_edges(d, edges);
    // //             }
    // //             d.n[n.id].r = {}; // might not need this because of delete above
    // //             d.n[n.id].c = {}; // content generated by reckon
    // //             //d.n[n.id].l = {}; // content generated by reckon
    // //             //d.n[n.id].w = {}; // content generated by reckon
    // //             //d.n[n.id].ax = {}; // content generated by reckon
    // //             if(m=='p'){
    // //                 d.n[n.id].t = d.t[n.t];
    // //                 if(d.n[n.id].n){
    // //                     //const edges = [];
    // //                     d.graph.for_stem(d, n.id, (r,n,t)=> d.delete.edge(d,r,n,{t:t})); //, no_update:true
    // //                     //    edges.push({r:r, n:n, t:t}); // , o:o this will cause reverse edges to be deleted on forward node
    // //                     //});
    // //                     //d.node.delete_edges(d, edges);
    // //                 }
    // //                 d.n[n.id].n = {}; // might not need this curve because of delete above  should respective r of other nodes 
    // //                 if(d.n[n.id].t=='profile'){
    // //                     data.ue.forEach(e=>{
    // //                         if(e.r==n.id && e.n==d.user) d.profile = n.id;
    // //                     });
    // //                 }
    // //                 //if(d.n[n.id].t=='public') d.public = n.id;
    // //                 ///////////////////if(d.cat_map[d.n[n.id].t]) d.cats[d.n[n.id].t] = n.id; // optimize with direct lookup ?!?!?!?!
    // //                 //console.log('got part: '+n.id+' ('+d.n[n.id].t+')'); // <<<<<<<<<<<<<<<<<<<<<<<< show part update
    // //             }else{  
    // //                 d.n[n.id].t = d.model_tags[d.n[n.id].m];
    // //                 d.graph.sv(d, n.id, n.v);//d.n[n.id].v = n.v;  
    // //                 //d.n[n.id].pin = n.v; 
    // //                 //console.log('got atom: '+n.id+' ('+d.n[n.id].t+')'); // <<<<<<<<<<<<< show atom update
    // //             }
    // //             set_update_graph = true;
    // //             d.n[n.id].open = true;
    // //             d.n[n.id].deleted = false;
    // //             ///////if(d.graph.n_vis[d.n[n.id].t]!=undefined) d.n[n.id].graph.vis = d.graph.n_vis[d.n[n.id].t];
    // //             //}
    // //         }); 
    // //     });
    // //     ['pe','be','ie','fe','se'].forEach(m=> data[m].forEach(e=>{  // use d.make.edge here so repeater takes action ?!?!?!?!?!?
    // //         const root_exists = d.graph.ex(d, e.r);
    // //         if(root_exists){ // change be to ex? (ex for exists)
    // //             if(!d.n[e.r].n[d.t[e.t]]) d.n[e.r].n[d.t[e.t]] = [];  
    // //             //if(d.order_tags.includes(d.t[e.t])){
    // //               //  d.n[e.r].n[d.t[e.t]].push(e.n); // <<<<<<<<< forward relationship !!!! (nodes) 
    // //             //}else{
    // //                 if(!d.n[e.r].n[d.t[e.t]].includes(e.n)) d.n[e.r].n[d.t[e.t]].push(e.n); // <<<<<<<<< forward relationship !!!! (nodes)
    // //             //}
    // //         }
    // //         if(d.graph.ex(d, e.n)){
    // //             if(root_exists && e.r==d.profile && d.t[e.t]=='asset') d.n[e.n].asset = true; // should put in base_reckon?! 
    // //             var rt = 'unknown';
    // //             if(d.root_tags[d.t[e.t]]){  rt = d.root_tags[d.t[e.t]];  } 
    // //             else{if(root_exists)      rt = d.n[e.r].t;           }
    // //             if(!d.n[e.n].r[rt]) d.n[e.n].r[rt] = []; 
    // //             //if(d.order_tags.includes(d.t[e.t])){
    // //                 //d.n[e.n].r[rt].push(e.r); 
    // //             //}else{
    // //                 if(!d.n[e.n].r[rt].includes(e.r)) d.n[e.n].r[rt].push(e.r);  // <<<<<<<<< reverse relationship !!!! (root)
    // //             //}
    // //         }
    // //     }));
    // //     ///////////////  \/ needed to recieve changes from other users?! \/ #1
    // //     // // // // data.p.forEach(n=>{
    // //     // // // //    if(d.graph.ex(d,n.id)) d.next('reckon.up', n.id);//d.reckon.up(d, n.id); // d.next('reckon.up',n.id); // run lowest level reckon only ?!?!?!?!
    // //     // // // // });
    // //     d.studio.ready = true;
    // //     if(set_update_graph) d.next('graph.update'); // only if add/remove or d.n[n].n/d.n[n].r changes
    // //     ['dp','db','di','df','ds'].forEach(m=>{
    // //         if(data[m]) data[m].forEach(n=> d.delete.node(d, n));
    // //     });

    // //     console.log(Object.keys(d.n).length);
    // // },

    // receive_deleted: (d, data)=>{ 
    //     ['p','b','i','f','s'].forEach(m=>{
    //         //d.delete.node(d, data[m].map(n=>n.id), true);
    //         data[m].forEach(n=>{
    //             d.delete.node(d, n.id); // shallow delete
    //         });
    //     });
    // },






    // receive_schema(d, schema){
    //     console.log('receive_schema');
    //     //console.log(schema);
    //     const icon = schema['Core']['@metadata']['icon'];
    //     for(const [Cls, n] of Object.entries(schema)){
    //         const cls = Cls.toLowerCase();
    //         if(n['@type'] == 'Enum'){
    //             d.enum[cls] = n['@values'];
    //             continue;
    //         }
    //         if(n['@abstract'] || n['@type'] != 'Class') continue;
    //         //if(n['@inherits'].includes('Asset')) d.add(d.asset_classes, cls);
    //         //if(n['@inherits'].includes('Admin')) d.add(d.admin_classes, cls);
    //         if(!d.node[cls]) d.node[cls] = {};
    //         const node = d.node[cls];
    //         node.tag = readable(cls);
    //         node.icon = icon.all[n['@metadata']?.icon];//static_url+'icon/node/'+cls+'.svg';
    //         node.icon = node.icon ?? icon.all['box'];
    //         //node.css  = {icon: n['@metadata']?.css?.icon ?? 'bi-box'};
    //         if(!node.stem) node.stem = {};
    //         for(const [t, s] of Object.entries(n)){
    //             if(t.charAt(0) == '@') continue
    //             const cls = d.as_array(s['@class'] ?? s).map(cls=> cls.toLowerCase()); // need to check if it is type enum and skip #1
    //             node.stem[t] = {
    //                 class: cls,
    //                 type:  (s['@type'] ?? 'Required').toLowerCase(),
    //             };
    //             const defaults = n['@metadata']?.default ?? {};
    //             if(defaults[t] != null) node.stem[t].default = defaults[t];
    //             if(cls.length == 1 && d.terminal_classes[cls[0]]){
    //                 if(cls[0] == 'boolean') d.add(d.boolean_tags, t);
    //                 if(cls[0] == 'integer') d.add(d.integer_tags, t);
    //                 if(cls[0] == 'decimal') d.add(d.decimal_tags, t);
    //                 if(cls[0] == 'string')  d.add(d.string_tags, t);
    //             }else if(!['user', 'drop', 'value'].includes(t)){
    //                 d.add(d.stem_tags, t);
    //                 if(!d.stem[t]) d.stem[t] = {
    //                     icon: icon.all[icon['stem'][t] ?? 'box'],
    //                 };
    //             }
    //         }
    //     }
    //     d.terminal_tags = [...d.boolean_tags, ...d.integer_tags, ...d.decimal_tags, ...d.string_tags];
    //     //d.node_classes = [...d.asset_classes, ...d.admin_classes];
    //     d.graph.init(d);
    //     d.studio.ready = true;
    //     console.log('node and stem info!!!!!!!!!!!!!!!!!');
    //     console.log(current(d.node));
    //     console.log(current(d.stem));
    // },




// receive_data: (d, triples)=>{// change to receive patches directly from server    must check if this data has been processed already, use d.make.part, d.make.edge, etc!!!!!!
//     console.log(triples);
//     for(const triple of triples){
//         if(triple.root.slice(0,5) == 'Class') console.log(triple);
//         const r = triple.root; 
//         if(triple.tag == 'rdf:type'){
//             if(!d.n[r]) d.n[r] = d.node_template(d, triple.stem.slice(8).toLowerCase());
//             if(d.terminal_classes[d.n[r].t]){
//                 delete d.n[r].n;
//             }else{
//                 d.graph.for_stem(d, r, (r,n,t)=> d.delete.edge(d, r, n, {t:t}));
//                 d.n[r].n = {};
//             }
//             d.pick.color(d, r);
//         }
//     }
//     // if(!d.user){
//     //     for(const triple of triples){
//     //         if(triple.stem['@type'] && triple.tag.slice(0, 8) == '@schema:'){
//     //             const r = triple.root;
//     //             if(d.n[r].t == 'user' && triple.tag.slice(8) == 'user' && triple.stem['@value'] == d.user_id){
//     //                 d.user = r;
//     //             }
//     //         }
//     //     }
//     // }
//     for(const triple of triples){
//         if(triple.tag.slice(0, 8) == '@schema:'){
//             const r = triple.root;
//             const t = triple.tag.slice(8);
//             if(triple.stem['@type']){
//                 if(t == 'value') d.graph.sv(d, r, triple.stem['@value']);
//             }else{
//                 d.make.edge(d, r, triple.stem, {t:t, received:true});
//             }
//         }
//     }
//     if(triples.length) d.next('graph.update');
//     //console.log(current(d.n));
// },






// receive_schema(d, schema){
//         console.log('receive_schema');
//         console.log(schema);
//         const classes = {};
//         for(const n of schema) classes[n['@id']] = n;
//         for(const n of schema){
//             if(n['@abstract']) continue
//             const cls = n['@id'].toLowerCase();
//             if(!d.node[cls]) d.node[cls] = {};
//             const node = d.node[cls];
//             node.icon = static_url+'icon/node/'+cls+'.svg';
//             node.tag = readable(cls);
//             if(!node.stem) node.stem = {};
//             const set_stems = n=>{
//                 for(const [t, s] of Object.entries(n)){
//                     if(t.charAt(0) == '@') continue
//                     const cls = (s['@class'] ?? s).toLowerCase();
//                     node.stem[t] = {
//                         class: cls,
//                         type:  (s['@type'] ?? 'Required').toLowerCase(),
//                     };
//                     const defaults = n['@metadata']?.default ?? {};
//                     if(defaults[t] != null) node.stem[t].default = defaults[t];
//                     if(d.terminal_classes.includes(cls)){
//                         if(cls == 'boolean') d.add(d.boolean_tags, t);
//                         if(cls == 'integer') d.add(d.integer_tags, t);
//                         if(cls == 'decimal') d.add(d.decimal_tags, t);
//                         if(cls == 'string')  d.add(d.string_tags, t);
//                     }else if(!['user', 'drop', 'value'].includes(t)){
//                         console.log('stem_tag', t);
//                         d.add(d.stem_tags, t);
//                     }
//                 }
//                 const inherits = d.as_array(n['@inherits']);
//                 if(inherits.includes('Asset')) d.add(d.asset_classes, cls);
//                 if(inherits.includes('Admin')) d.add(d.admin_classes, cls);
//                 inherits.forEach(cls=> set_stems(classes[cls]));
//                 node.css  = {icon: n['@metadata']?.css?.icon ?? 'bi-box'};
//             }
//             set_stems(n);
//         }
//         d.terminal_tags = [...d.boolean_tags, ...d.integer_tags, ...d.decimal_tags, ...d.string_tags];
//         d.node_classes = [...d.asset_classes, ...d.admin_classes];
//         d.graph.init(d);
//         d.studio.ready = true;
//         console.log(current(d.node));
//     },



// const asset_classes = [
//     'product', 'point', 'curve', 'sketch', 'transform', // 'repeater', 'group', 
//     'ellipse', 'surface', 'shape', 'layer', 'image', 'brush', 'stroke',
//     'slice', 'post', 'machine',
// ]; 

// const cat_tags = [ //cat_cast_tags=[ // should call them boolean_tags ?!?!?!?!?!
//     'public', 'manual_compute', // 'auxiliary', 'top_view', 'side_view', 'face_camera', 'manual_compute', // 'front_view',
//     //'fill', 'corner',
// ];
//const cast_tags = [...cat_tags];//[...cat_tags, 'base_matrix']; // , 'base_invert'
//const cast_shallow_tags = ['public', 'auxiliary',];

// const component = {
//     Point, Curve, Shape, Surface, Sketch,
//     Transform, Layer, Image, Mixed_Curve
// };

//const cat_map = Object.fromEntries(cat_tags.map(t=>[t,true])); //cat_cast_tags
//const category_tags = ['public', 'auxiliary', ...cat_cast_tags,];
//const admin_classes = ['profile'];//, ...cat_tags]; //category_tags
// const boolean_tags = [model_tags['b'],
//     'visible', 'autocalc', 
//     'coil', 'axial', 'corner',
// ];
// const integer_tags = [model_tags['i'],
//     'order', 'current_image', 
//     'layers', 'axes', 'repeats', 'slows',
// ];
// const decimal_tags    = [model_tags['f'], // rename to number_tags
//     'x', 'y', 'z', 'move_x', 'move_y', 'move_z', 'turn_x', 'turn_y', 'turn_z', 'scale_x', 'scale_y', 'scale_z',
//     'radius_a', 'radius_b', 'angle_a', 'angle_b', 'axis_x', 'axis_y', 'axis_z',
//     'width', 'height',
//     'spread_angle', 
//     'slice_spacing', 'slice_offset', 'layer_spacing', 'layer_offset',
//     'cord_radius', 'speed', 'flow',  
//     'origin_x', 'origin_y', 'origin_z', 'origin_a', 
//     'holder_y', 'holder_x1', 'holder_x2', 'holder_x3', 'holder_x4', 'holder_x5',
//     'offset_x1', 'offset_x2', 'offset_x3', 'offset_x4', 'offset_x5', //'offset_a',
//     'fluid_z', 
// ];
// const string_tags = [model_tags['s'], // rename to text_tags
//     'name', 'story', 'code', 'data',
//     'color_a', 'color_b',
//     'material', 'fiber',
//     'plane',
// ]; 



// join_float_32_arrays(arrays){
    //     const lengths = arrays.map(v=> v.length);
    //     const result = new Float32Array(lengths.reduce((a,b)=>a+b,0));
    //     for (let i=0; i<arrays.length; i++){
    //         let start = lengths.slice(0,i).reduce((a,b)=>a+b,0);
    //         result.set(arrays[i], start); 
    //     }
    //     return result;
    // },
    // try(...funcs){
    //     const result = null;
    //     for(var i=0; i<funcs.length; i++){
    //         try{ result = funcs[i](result);
    //         }catch{ break; }
    //     }
    // },



// const stem_tags = [
//     'boundary', 'guide', 'mix', 'target', 'mixed_curve',// 'speed_curve',
// ]; 


// const component = {
//     'point':       Point,
//     'curve':       Curve,
//     'mixed_curve': Curve,
//     'shape':       Shape,
//     'surface':     Surface,
//     'sketch':      Sketch,
//     'transform':   Transform,
//     'layer':       Layer,
//     'image':       Image,
//     'ellipse':     Curve,
//     'slice':       Curve,
//     'post':        Curve,
// };

                                //d.graph.for_root(d, n, rr=>{
                                //    if(r==rr) dead_edges.push({r:r, n:n, t:t, o:o});
                                //}); // don't have to set to null if set deleted after?

//const to_del = edits.parts.filter(p=> edits.pdel.includes(p[0][0]));
        //console.log('to_del');
        //console.log(to_del);
        //edits.parts.forEach(p=>{
        //});
        //console.log('edits');
        //console.log(edits);
        //d.pick.update(d);
        //d.design.update(d);
        //d.graph.update(d); // only run graph if something was deleted or added? 
        //d.inspect.update(d); // might not need this

// design: {
    //     part:null, candidate:null, 
    //     update: d=>{
    //         if(d.pick.n.length == 1 && design_tags.includes(d.n[d.pick.n[0]].t)){  d.design.candidate = d.pick.n[0];  } 
    //         else{  d.design.candidate = null;  }
    //         if(d.design.part && !d.n[d.design.part].open){ // use exists/available function here?
    //             d.design.part = null;
    //             d.studio.mode = 'graph'; // move to studio update? only modify this section in update!!!
    //         }
    //     },
    // },

// if(update_funcs[d.n[n.id].t]){
//     d.n[n.id].update = update_funcs[d.n[n.id].t](n.id);
// }else{
//     d.n[n.id].update = update_funcs['default'](n.id);
// }


                    //const part = [[n],        [], [], [], [], [], ['add']];
                    //const tags = [[d.n[n].t], [], [], [], [], []];
                //     const et = patch.path[3];
                //     const m = ['r','p','b','i','f','s'].indexOf(d.n[d.n[n].n[et][0]].m);
                //     if(patch.path.length > 4){
                //         part[m].push(d.n[n].n[et][patch.path[4]]);
                //         tags[m].push(et);
                //     }
                    //edits.parts.push(part);
                    //edits.t.push(tags);


//const mi = 6; // unknown model because this node is not loaded on client. Do not clear on server
                                //if(et!='unknown') mi = ['r','p','b','i','f','s'].indexOf(d.n[nid].m);

//if(e.t.v=='asset' && d.n[e.r.id].profile) d.n[n.id].asset = true; //t=='profile' && d.n[e.r.id].u.id==user_id
//if(e.t.v=='asset' && d.n[n.id].profile && d.n[e.n.id]) d.n[e.n.id].asset = true;

//if(terminal_tags.includes(t)){  d.inspect.c[t] = d.selected.nodes.filter(n=> d.n[n].m==t).map(n=> d.n[n].v).find(v=> v!=null);  }
            //else{  d.inspect.c[t] = d.selected.nodes.map(n=> d.n[n].c[t]).find(v=> v!=null);  }

//delete d.inspect[t];
            //const vals = d.selected.nodes.map(n=> d.n[n].c[t]);
            //if(vals) d.inspect[t] = vals.find(val=> val!=null);


// export const node_tag = [ // make it so this reads from server
//     'Profile', 'Public', // admin
//     'Point', 'curve', // geom
//     ...Object.values(terminal_tags), 
// ];

// d.selected.nodes = [];
        // Object.entries(d.n).forEach(([id,n],i)=>{if(n.selected){ // use filter than forEach for optimization?
        //     d.selected.nodes.push({id:id, name:n.c.name});
        // }});
        //d.selected.names = d.selected.nodes.map(n=> d.n[n].c.name);

//xyz:(pos)=>[pos.x, pos.y, pos.z],

// if(selected){ 
//     const i = d.selection.indexOf(id);
//     if (i < 0) d.selection.push(id); 
// }else{ 
//     const i = d.selection.indexOf(id);
//     if (i !== -1) d.selection.splice(i, 1);
// }

// select: (id, selected)=>set(produce(d=>{  // make hover action and hovering store so the same node is highlighted for different occurances
//     if(selected){ 
//         const i = d.selection.indexOf(id);
//         if (i < 0){
//             d.selection.push(id); 
//             //d.n[id].gen.selected = true;
//         }
//     } 
//     else{ 
//         const i = d.selection.indexOf(id);
//         if (i !== -1){
//             d.selection.splice(i, 1);
//             //d.n[id].gen.selected = false;
//         }
//     } 
// })),



// name: id=> {
//     const n = get().n;
//     return n[id].m=='p' && n[id].n.name && n[n[id].n.name[0]] ? n[n[id].n.name[0]].v : null;
// },

// tag: id=> {
    //     const n = get().n;
    //     return n[id].m=='p' && n[id].t ? uppercase(n[id].t) : terminal_tags[n[id].m];
    // },