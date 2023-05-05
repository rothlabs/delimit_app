import {createElement as r, useRef, useState, useEffect, Fragment} from 'react';
import {Canvas} from 'r3f';
import {Toolbar} from './toolbar/toolbar.js';
import {useD, use_query, use_mutation} from '../app.js';
import {Viewport} from './viewport.js';

//export const selection_rv = makeVar();
//export const action_rv = makeVar({name:'none'}); // renamed to history action ?
//export const show_points_rv = makeVar(true);
//export const show_endpoints_rv = makeVar(true);
//export const draw_mode_rv = makeVar('draw');

const edges = ['p','b','i','f','s'].map(m=> m+'e{ t{v} n{id}} ').join(' ');
const atoms = ['b','i','f','s'].map(m=> m+'{id v e{t{v}r{id}}} ').join(' '); // can use r{id} instead

export function Studio(){
    const d = useD.getState();
    const merge = useD(d=> d.merge);
    const search = useD(d=> d.search);
    const open_pack = use_mutation('OpenPack', [ //pack is a part that holds all models instances to specified depth and the first sub part holds all roots  
        ['openPack pack{ p{ id t{v} e{t{v}r{id}} '+edges+' } '+atoms+ ' } ',
            ['Int depth', search.depth], ['[ID] ids', search.ids], ['[[String]] include', null], ['[[String]] exclude', null]]  //[['s','name','cool awesome']]
    ],{onCompleted:(data)=>{
        data = data.openPack;
        //console.log(data.pack) //.p[7].pp1.map(e1=> e1.n2.id).join(', ')
        if(data.pack) merge(data.pack); 
        console.log(useD.getState().n)
    }}); 
    useEffect(()=>{
        if(Object.keys(d.n).length < 1) open_pack.mutate();
    },[]);
    const mutations = useD(d=> d.mutations);
    // const push_pack = use_mutation('PushPack', [ 
    //     ['pushPack pack{p{id t{v} '+edges+' pp2{t1{v} n1{id}}} '+atoms+ '}',
    //         ['Int depth', search.depth], ['[ID] ids', search.ids], ['[[String]] include', null], ['[[String]] exclude', null]]  //[['s','name','cool awesome']]
    // ],{onCompleted:(data)=>{
    //     data = data.openPack;
    //     if(data.pack) merge(data.pack); 
    //     //console.log(useD.getState().n)
    // }}); 
    //console.log('render studio');
    return (
        r(Fragment,{}, 
            r(Poll), 
            r(Toolbar),
            r('div', {name:'r3f', className:'position-absolute start-0 end-0 top-0 bottom-0', style:{zIndex: -1}},
                r(Canvas,{orthographic:true, camera:{position:[0, 0, 1000]}}, //, far:10000 zoom:1    //frameloop:'demand', 
                    r(Viewport),
                )
            )
        )
    )
}

function Poll(){
    const merge = useD(d=> d.merge);
    const clear_poll = use_mutation('Clear_Poll', [  
        ['clearPoll reply'] 
    ]); 
    use_query('PollPack', [ // rerenders this component on every poll
        ['pollPack p{ id t{v} e{t{v}r{id}} '+edges+' } '+atoms]
    ],{notifyOnNetworkStatusChange:true, pollInterval: 1000, onCompleted:(data)=>{ //fetchPolicy:'no-cache',
        if(data.pollPack) merge(data.pollPack);
        clear_poll.mutate();
    }}); 
    return null;
}


//import {useParams} from 'rrd';

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