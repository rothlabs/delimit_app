import {createElement as r, useRef, useState, useEffect, Fragment} from 'react';
import {Canvas} from 'r3f';
import {Toolbar} from './toolbar.js';
//import {Inspector} from './inspector/inspector.js';
//import {useParams} from 'rrd';
import {makeVar, useReactiveVar} from 'apollo';
import {use_mutation, use_effect} from '../app.js';
import {Viewport} from './viewport.js';
import {use_d} from '../state/state.js';

export const selection_rv = makeVar();
export const search_rv = makeVar({depth:null, ids:null});
export const action_rv = makeVar({name:'none'}); // renamed to history action ?
export const show_points_rv = makeVar(true);
export const show_endpoints_rv = makeVar(true);
export const draw_mode_rv = makeVar('draw');

const edges = ['p','b','i','f','s'].map(m=> 'p'+m+'1{t2{v} m2{id}}').join(' ');
const atoms = ['b','i','f','s'].map(m=> m+'{id v p'+m+'2{t1{v} m1{id}}}').join(' ');

export function Studio(){
    const add_pack = use_d(d=> d.add_pack);
    const search = useReactiveVar(search_rv);
    const open_pack = use_mutation('OpenPack', [ //pack is a part that holds all models instances to specified depth and the first sub part holds all roots  
        ['openPack pack{p{id t{v} '+edges+' pp2{t1{v} m1{id}}} '+atoms+ '}',
            ['Int depth', search.depth], ['[ID] ids', search.ids], ['[[String]] include', null], ['[[String]] exclude', null]]  //[['s','name','cool awesome']]
    ],{onCompleted:(data)=>{
        data = data.openPack;
        if(data.pack) add_pack(data); 
        console.log(use_d.getState().n)
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