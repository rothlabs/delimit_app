import {createElement as c, useRef, useState, useEffect, Fragment} from 'react';
import {Canvas} from '@react-three/fiber';
import {Toolbar} from './toolbar/toolbar.js';
import {useS, gs, ss, rs, use_query, use_mutation, instance} from '../../app.js';
import {Viewport} from './viewport.js';
import {Panel} from './panel/panel.js';

const edges = ['p','b','i','f','s','u'].map(m=> m+'e{r t n} ').join(' ');
const atoms = ['b','i','f','s'].map(m=> m+'{id v}').join(' ');  // const atoms = ['b','i','f','s'].map(m=> m+'{id v e{t{v} r{id}}} ').join(' '); // can use r{id} instead

export function Studio(){
    const ready = useS(d=> d.studio.ready);
    return (
        c(Fragment,{}, 
            c(Open_Push_Close),
            ready && c(Poll), 
            c(Toolbar),
            c(Panel),
            c('div', {name:'r3f', className:'position-absolute start-0 end-0 top-0 bottom-0', style:{zIndex: -1}},
                c(Canvas,{orthographic:true, camera:{position:[0, 0, 400], far:10000}}, //, far:10000 zoom:1    //frameloop:'demand', 
                    c(Viewport),
                )
            )
        )
    )
}

function Open_Push_Close(){
    const search = useS(d=> d.search);
    const open_pack = use_mutation('OpenPack', [ //pack is a part that holds all models instances to specified depth and the first sub part holds all roots  
        ['openPack pack{ t{id v} p{id t} '+edges+' '+atoms+' } ',  //['openPack pack{u{id} tag{id v} p{id} '+atoms+' '+edges+' } ',   //['openPack pack{ p{ id t{v} e{t{v}r{id}} u{id} '+edges+' } '+atoms+ ' } ',
            ['Int depth', search.depth], ['[ID] ids', search.ids], ['[[String]] include', null], ['[[String]] exclude', null]]  //[['s','name','cool awesome']]
    ],{onCompleted:(data)=>{data = data.openPack;
        console.log('Open Pack - complete');
        console.log(Date.now()/1000 - 1685555000);
        if(data.pack) rs(d=> d.receive(d,data.pack) ); 
        //console.log(data);
        //console.log(useS.getState().n);
    }}); 
    useEffect(()=>{
        if(Object.keys(gs().n).length < 1) {
            console.log('Open Pack - mutate');
            console.log(Date.now()/1000 - 1685555000);
            open_pack.mutate();
        }
    },[]);
    const push_pack = use_mutation('PushPack', [['pushPack reply', // send edges as [ID] pr_id, [ID] pn_id, [ID] pt_id,  [ID] parts, [ID] floats 
        ['String instance', instance],
        ['[[ID]] atoms',    null], 
        ['[Boolean] b',     null],
        ['[Int] i',         null],
        ['[Float] f',       null],
        ['[String] s',      null],
        ['[[[ID]]] parts',  null], // should split so first id is not [ID] for part make seperate list that coresponds?
        ['[[[ID]]] t',      null],
        ['[ID] pdel',       null],
        ['[ID] bdel',       null],
        ['[ID] idel',       null],
        ['[ID] fdel',       null],
        ['[ID] sdel',       null],
    ]],{onCompleted:(data)=>{data = data.pushPack;
        console.log('Push Pack - complete: ',data.reply);
    }});
    // merge with push_pack ?!?! Or make delete_pack and keep all types of ops seperate?
    const close_pack = use_mutation('ClosePack', [['closePack reply', 
        ['[ID] p', null], ['[ID] b', null], ['[ID] i', null], ['[ID] f', null], ['[ID] s', null],
    ]],{onCompleted:data=>{ 
        console.log('Close Pack - complete');
        //console.log(data.closePack.reply);
    }}); 
    useEffect(()=>{
        ss(d=> d.open_pack = open_pack.mutate );//d.set(d=> {d.open_pack = open_pack.mutate;});
        ss(d=> d.push_pack = push_pack.mutate );//d.set(d=> {d.push_pack = push_pack.mutate;});
        ss(d=> d.close_pack = close_pack.mutate );//d.set(d=> {d.close_pack = close_pack.mutate;});
    },[]);
    return null;
}

function Poll(){ // appears to be a bug where the server doesn't always catch changes so doesn't deliver in poll pack?
    //const merge = useD(d=> d.merge);
    // const cycle_poll = use_mutation('Cycle_Poll', [  
    //     ['cyclePoll reply'] 
    // ]); 
    
    use_query('PollPack', [ // rerenders this component on every poll
        ['pollPack p{id t} '+edges+' '+atoms+ ' dp db di df ds', ['String instance', instance]], //['pollPack p{id t} '+edges+' '+atoms, ['String instance', instance]], //['pollPack p{ id t{v} e{t{v}r{id}} u{id} '+edges+' } '+atoms, ['String instance', instance]],
        //['deletePack p{id t} '+atoms, ['String instance', instance]] //['deletePack p{id} b{id} i{id} f{id} s{id}', ['String instance', instance]]
    ],{notifyOnNetworkStatusChange:true, pollInterval: 1000, onCompleted:(data)=>{ //fetchPolicy:'no-cache',
        //if(data.pollPack) console.log(data.pollPack);
        if(data.pollPack) {
            if(data.pollPack) console.log('poll pack recieved', data.pollPack);
            //if(data.deletePack && data.deletePack.p.length > 0) console.log('delete pack part recieved', data.deletePack.p);
            //console.log(data.pollPack.s.find(s=> s.v==instance));
            rs(d=> d.receive(d, data.pollPack)); // do not read anything older than when loader!!!!!!!
        }
        //if(data.deletePack) rs(d=> d.receive_deleted(d, data.deletePack) ); 
        //cycle_poll.mutate(); // very bad because the server might actually clear poll right after it gets new content and then never sends it on next request
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