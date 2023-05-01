import {createElement as r, useRef, useState, useEffect, Fragment} from 'react';
import {Canvas} from 'r3f';
import {Toolbar} from './toolbar.js';
//import {Inspector} from './inspector/inspector.js';
import {useParams} from 'rrd';
import {makeVar, useReactiveVar} from 'apollo';
import {use_query, use_mutation, use_effect, random_vector} from '../app.js';
import {Viewport} from './viewport.js';
import {Vector3} from 'three';
import {graph_z} from './graph/graph.js';
import {create} from 'zustand';
import {produce} from 'immer';
import {subscribeWithSelector} from 'zmiddle';

//export const pack_rv = makeVar({all:{},p:{},b:{},i:{},f:{},s:{}});
export const selection_rv = makeVar();
export const search_rv = makeVar({depth:null, ids:null});
export const action_rv = makeVar({name:'none'}); // renamed to history action ?
export const show_points_rv = makeVar(true);
export const show_endpoints_rv = makeVar(true);
export const draw_mode_rv = makeVar('draw');

const edges = ['p','b','i','f','s'].map(m=> 'p'+m+'1{t2{v} m2{id}}').join(' ');
const atoms = ['b','i','f','s'].map(m=> m+'{id v p'+m+'2{t1{v} m1{id}}}').join(' ');


export const use_store = create(subscribeWithSelector((set,get) => ({
    //all:[], // rename to nodes
    //p: {},
    //b: {},
    //i: {},
    //f: {},
    //s: {},
    n: {},
    //edges: {},
    //move_node: (id,pos)=>set(produce(store=>{
    //    store.nodes[id].pos.add(pos);
    //})),
    //edit_nodes: func=>set(produce(d=>{
    //    Object.values(d.n).forEach(n=>func(n));
    //})),
    //iterate_edge_nodes: (node, func)=>{
    //    node.e.forEach(e=> func(get().nodes(e.id)));
    //},
    mutate: func=>set(produce((d)=>func(d))),
    add_pack: data=>set(produce(d=>{
        const window_size = (window.innerWidth+window.innerHeight)/4;
        ['b','i','f','s'].forEach(m=>{
            data.pack[m].forEach(a=>{
                if(d.n[a.id]){
                    //d.n[a.id].id = a.id;
                    d.n[a.id].v = a.v;
                    d.n[a.id].e2 = {}; // clear edges
                    d.n[a.id].e = [];
                }else{  
                    d.n[a.id] = { m:m, v:a.v, e2:{}, e:[], 
                        pos: random_vector({min:window_size, max:window_size*1.5, z:graph_z}), 
                        dir: new Vector3(),
                        num: 0}; //makeVar({dynamic:false})
                    //store.all.push(a.id);//store.all[a.id] = store[m][a.id];
                }
            }); 
        });
        data.pack.p.forEach(p=>{
            if(d.n[p.id]){
                //d.n[p.id].id = p.id; 
                d.n[p.id].t = p.t.v; 
                d.n[p.id].e1 = {}; // clear forward edges 
                d.n[p.id].e2 = {}; // clear reverse edges 
                d.n[p.id].e = [];
            }else{
                d.n[p.id] = {  m:'p', t:p.t.v, e1:{}, e2:{}, e:[], 
                    pos: random_vector({min:window_size, max:window_size*1.5, z:graph_z}), 
                    dir: new Vector3(),
                    num: 0}; 
                //store.all.push(p.id);//store.all[p.id] = store.p[p.id];
            }
        });
        ['b','i','f','s'].forEach(m=>{
            data.pack[m].forEach(a=>{
                a['p'+m+'2'].forEach(e2=>{ if(e2.t1) d.n[a.id].e2[e2.t1.v] = []; });
                a['p'+m+'2'].forEach(e2=>{ 
                    if(e2.t1){ 
                        //d.n[a.id].edges.push({id:e2.m1.id, t1:e2.t1.v}); 
                        //if(store.p[e2.m1.id]){  
                            d.n[a.id].e2[e2.t1.v].push(e2.m1.id);  // <<<<<<<<< reverse relationship !!!!
                            d.n[a.id].e.push(e2.m1.id);
                        //} 
                        //else{  store[m][a.id].e2[e2.t1.v].push(e2.m1.id);  } // if record not loaded, add id so it can be loaded at the press of a button
                    }
                });
            });
        });
        data.pack.p.forEach(p=>{ 
            ['p','b','i','f','s'].forEach(m=>{
                p['p'+m+'1'].forEach(e1=>{ if(e1.t2) d.n[p.id].e1[e1.t2.v] = []; });
                p['p'+m+'1'].forEach(e1=>{
                    if(e1.t2){
                        //d.n[p.id].edges.push({id:e1.m2.id, t2:e1.t2.v});
                        //if(store[m][e1.m2.id]){  
                            d.n[p.id].e1[e1.t2.v].push(e1.m2.id); // <<<<<<<<< forward relationship !!!!
                            if(!d.n[p.id].e.includes(e1.m2.id)) d.n[p.id].e.push(e1.m2.id); 
                        //} 
                        //else{  store.p[p.id].e1[e1.t2.v].push(e1.m2.id);  }
                    }
                });
            });
            p['pp2'].forEach(e2=>{ if(e2.t1) d.n[p.id].e2[e2.t1.v] = []; });
            p['pp2'].forEach(e2=>{
                if(e2.t1){ 
                    //d.n[p.id].edges.push({id:e2.m1.id, t1:e2.t1.v});
                    //if(store.p[e2.m1.id]){  
                        d.n[p.id].e2[e2.t1.v].push(e2.m1.id);   // <<<<<<<<< reverse relationship !!!!
                        if(!d.n[p.id].e.includes(e2.m1.id)) d.n[p.id].e.push(e2.m1.id);
                    //} 
                    //else{  store.p[p.id].e2[e2.t1.v].push(e2.m1.id);  }
                }
            });
        }); 
        console.log(d);
    })),
})));

export function Studio(){
    //const pack = useReactiveVar(pack_rv);
    const add_pack = use_store(d=> d.add_pack);
    const search = useReactiveVar(search_rv);
    const open_pack = use_mutation('OpenPack', [ //pack is a part that holds all models instances to specified depth and the first sub part holds all roots  
        ['openPack pack{p{id t{v} '+edges+' pp2{t1{v} m1{id}}} '+atoms+ '}',
            ['Int depth', search.depth], ['[ID] ids', search.ids], ['[[String]] include', null], ['[[String]] exclude', null]]  //[['s','name','cool awesome']]
    ],{onCompleted:(data)=>{
        data = data.openPack;
        if(data.pack){
            add_pack(data);
            //pack_rv(pack);
            //pack_rv().p['WRNPQizoTxfaqOYh'].wow = 'so cool'; // not reactive
            //immer(pack_rv, draft => {draft.p['WRNPQizoTxfaqOYh'].wow = 'so cool';}); // reactive 
            //console.log(pack_rv()); // hope it shows the change. this means i could change without reacting if needed 
        }
    }}); 
    use_effect([search],()=>{
        //console.log('search');
        open_pack.mutate();
    });
    return (
        r(Fragment,{}, 
            r(Toolbar),
            //r(Inspector),
            r('div', {name:'r3f', className:'position-absolute start-0 end-0 top-0 bottom-0', style:{zIndex: -1}},
                r(Canvas,{orthographic:true, camera:{position:[0, 0, 1000]}}, //, far:10000 zoom:1    //frameloop:'demand', 
                    r(Viewport),
                )
            )
        )
    )
}


// produce(pack[m][a.id], draft => {
                        //     draft.id = a.id;
                        //     draft.v = a.v;
                        //     draft.e2 = {}; // clear edges
                        //     draft.all_e = [];
                        // });
                        //reactive_var(reactive_var(), draft => {
                        //    draft
                        //}));


//{t: p.t.map(t=> part.t[t.id])};
            //if(pack.p[p.id].t[0]=='root')

// Must change this so it creates an array for each relationship tag and pushes to that array. There might be more than one point for example !!!!!
        // data.pack.p.forEach(p=>{ 
        //     ['rp','pb','pi','pf','ps'].forEach(m=>{
        //         p[m].forEach(e=>{
        //             pack.p[p.id][pack.t[e.t.id].v] = pack[m.charAt(1)][e[m.charAt(1)].id];
        //             //pack.p[p.id][pack.t[e.t1.id].v] = pack[m.charAt(1)][e[m.charAt(1)].id];  // <<<<<<<<< forward relationship !!!!
        //             //pack.p[e[m.charAt(1)].id][pack.t[e.t2.id].v] = pack[m.charAt(1)][p.id];  // <<<<<<<<< reverse relationship !!!!
        //         });
        //     });
        // }); 
        // pack.root = pack.p[data.pack.p[0].id];

// const [data, status] = use_query('GetProject',[ // this will allow a single import and single export and all semantics will be managed in editor
//         [`project id name story file public owner{id firstName} parts{id}
//             p{id p{id} u{id} f{id} s{id}} f{id v} s{id v}`, 
//             ['String! id', useParams().id]], 
//         ['user id'],
//     ],{onCompleted:(data)=>{
//         editor_rv(data)
//         no_edit_rv(true); no_copy_rv(true);
//         if(data.user && data.user.id == data.project.owner.id) {
//             no_edit_rv(false); no_copy_rv(false);
//         }else{ if(data.user && data.project.public) no_copy_rv(false); }
//     }}); 

//!data ? status && r(status) :

//p{id p{id} u{id} f{id} s{id}}
//            f{id v} s{id v}`
// parts{id deps sups floats{id} chars{id}}
// floats{id val}
// chars{id val}

// vectors{id name x y z} 
//           lines{id name points}`