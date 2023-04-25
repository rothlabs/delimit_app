import {createElement as r, useRef, useState, useEffect, Fragment} from 'react';
import {Canvas} from 'r3f';
import {Toolbar} from './toolbar.js';
import {useParams} from 'rrd';
import {makeVar, useReactiveVar} from 'apollo';
import {use_query, use_mutation, use_effect} from '../app.js';
import { Viewport } from './viewport.js';

//export const pack_rv
//export const no_edit_rv = makeVar(true);
//export const no_copy_rv = makeVar(true);
export const pack_rv = makeVar();
export const action_rv = makeVar({name:'none'});
//export const editor_rv = makeVar();
export const show_points_rv = makeVar(true);
export const show_endpoints_rv = makeVar(true);
export const draw_mode_rv = makeVar('draw');
//export const project_rv = makeVar();
export const selection_rv = makeVar();
//export const sketches_rv = makeVar();

const throughs = ['p','b','i','f','s'].map(m=> 'p'+m+'1{t1{v} t2{v} m2{id}}').join(' ');

export function Studio(){
    const open_pack = use_mutation('OpenPack', [  // pack is a part that holds all models instances to specified depth and the first sub part holds all roots  
        ['openPack pack{p{id t{v} '+throughs+'} b{id v} i{id v} f{id v} s{id v}}',
            ['Int depth', null], ['ID id', null], ['[[String]] include', null], ['[[String]] exclude', null]],  //[['s','name','cool awesome']]
    ],{onCompleted:(data)=>{
        console.log(data.pack);
        const packet = {p:{}};
        ['b','i','f','s'].forEach(m=>{
            packet[m] = {};
            data.pack[m].forEach(e=> packet[m][e.id] = {v:e.v}); // come back to make r a list of objects instead of list of ids
        });
        data.pack.p.forEach(p=>{ 
            packet.p[p.id] = {t:p.t.v};//{t: p.t.map(t=> part.t[t.id])};
            //if(packet.p[p.id].t[0]=='root')
        });
        // Must change this so it creates an array for each relationship tag and pushes to that array. There might be more than one point for example !!!!!
        // data.pack.p.forEach(p=>{ 
        //     ['rp','pb','pi','pf','ps'].forEach(m=>{
        //         p[m].forEach(e=>{
        //             packet.p[p.id][packet.t[e.t.id].v] = packet[m.charAt(1)][e[m.charAt(1)].id];
        //             //packet.p[p.id][packet.t[e.t1.id].v] = packet[m.charAt(1)][e[m.charAt(1)].id];  // <<<<<<<<< forward relationship !!!!
        //             //packet.p[e[m.charAt(1)].id][packet.t[e.t2.id].v] = packet[m.charAt(1)][p.id];  // <<<<<<<<< reverse relationship !!!!
        //         });
        //     });
        // }); 
        // packet.root = pack.p[data.pack.p[0].id];
        // console.log(packet);
        pack_rv(packet);
        //['p','b','i','f','s'].forEach(m=>{
        //    data.pack.p[0][m].forEach(e=> packet.roots.push(packet[m][e.id]) );
        //});
        //{p:e.p, t:e.t, b:e.b, i:e.i, f:e.f, s:e.s, r:e.r}
        // pack.p.forEach(part=>{
        //     if(part.t) part.r.forEach(r=> pack.p[r][pack.t[part.t[0]].v] = part);
        // });
        // ['p','b','i','f','s'].forEach(model=>{
        //     pack.p[0][model].forEach(id=>{
        //         pack.roots.push(pack[model][id]);
        //     });
        // });
    }}); 
    return (
        r(Fragment,{}, 
            r(Toolbar),
            r('div', {name:'r3f', className:'position-absolute start-0 end-0 top-0 bottom-0', style:{zIndex: -1}},
                r(Canvas,{orthographic:true, camera:{position:[0, 0, 100]}}, r(Viewport))
            )
        )
    )
}

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