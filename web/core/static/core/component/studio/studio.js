import {createElement as c, useRef, useState, useEffect, Fragment} from 'react';
import {Canvas, useThree} from '@react-three/fiber';
//import {useS, gs, ss, rs, use_query, use_mutation, client_instance} from '../../app.js';
import {Toolbar} from '../toolbar/toolbar.js';
import {Viewport} from './viewport.js';
import {Code} from './code.js';
import {Repo} from './repo.js';
import {Panel} from '../panel/panel.js';
import {Mode_Bar} from './mode_bar.js';
import {Panel_Bar} from './panel_bar.js';
import {Container, Row, Col, Badge, Button, InputGroup, Form} from 'react-bootstrap';
import {Box3} from 'three';

import {use_store, get_store, use_window_size} from 'delimit';


// useLazyQuery!!!
// https://www.apollographql.com/docs/react/data/queries


//document.getElementById('sandbox').contentWindow.postMessage();

// window.addEventListener(
//     "message",
//     (event) => {
//         console.log(event);
//       //if (event.origin !== "http://example.org:8080") return;
  
//       // …
//     },
//     false,
// );


// const getGeneratedPageURL = ({ html, css, js }) => {
//     const getBlobURL = (code, type) => {
//       const blob = new Blob([code], { type });
//       return URL.createObjectURL(blob)
//     }
  
//     const cssURL = getBlobURL(css, 'text/css');
//     const jsURL = getBlobURL(js, 'text/javascript');
  
//     const source = `
//       <html>
//         <head>
//           ${css && `<link rel="stylesheet" type="text/css" href="${cssURL}" />`}
//           ${js && `<script src="${jsURL}"></script>`}
//         </head>
//         <body>
//           ${html || ''}
//         </body>
//       </html>
//     `
  
//     return getBlobURL(source, 'text/html')
//   }
  
//   const url = getGeneratedPageURL({
//     html: '<p>Hello, world!</p>',
//     css: 'p { color: blue; }',
//     js: `
//     console.log("hiiiiiiiiiiiiiii");

//     `
//   })
  
// var sample = document.createElement('iframe');
// sample.src = url;// __jailed__path__ + '_frame.html';
// sample.sandbox = 'allow-scripts';//perm.join(' ');
// //sample.style.display = 'none';
// document.body.appendChild(sample);
//   //const iframe = document.getElementById('sandbox'); //document.querySelector('#iframe')
//   //iframe.src = url;
  


//const edges = ['p','b','i','f','s','u'].map(m=> m+'e{r t n} ').join(' ');
//const atoms = ['b','i','f','s'].map(m=> m+'{id v}').join(' ');  // const atoms = ['b','i','f','s'].map(m=> m+'{id v e{t{v} r{id}}} ').join(' '); // can use r{id} instead

export function Studio(){
    return (
        c(Col, {className:'d-flex flex-column'}, 
            c(Row, {},
                c(Col, {}, c(Toolbar)) 
            ),
            c(Row, {className: 'flex-grow-1 g-0'}, 
                c(Col, {className:'col-auto d-flex flex-column', style:{zIndex:1}}, c(Panel_Bar)), // d-flex flex-column
                c(Col, {className:'d-flex flex-column'}, 
                    c(Row,{className:'g-0 flex-grow-1'}, c(Panel_Workspace)), // className:'col-auto'
                )
            ),
            //),
            //c(Reckon_Count),
        )
    )
}
//c(Get_Schema),
//c(Open_Push_Close),
//ready && c(Poll),
// function Reckon_Count(){
//     const reckon_count = use_store(d=> d.reckon.count);
//     return c(Badge, {className:'position-absolute bottom-0 start-0 m-1'}, 'Computes: '+reckon_count);
// }

    // style:{
    //                         maxHeight: height,
    //                         overflow: 'auto',
    //                         //scrollbarColor: 'red orange',
    //                     },

function Panel_Workspace(){
    const studio_mode = use_store(d=> d.studio.mode);
    const panel_mode = use_store(d=> d.studio.panel.mode);
    //let [height] = use_window_size();
    //height = height * .9 + '';
    const height = '90vh';
    if(studio_mode == 'graph' || studio_mode == 'design'){
        return [
            panel_mode && c(Col, {
                className:'border-end', 
                style:{zIndex:1, backgroundColor:'var(--bs-body-bg)', maxHeight:height, overflow:'auto'}
            }, c(Panel)), // d-flex flex-column
            c(Col, {className:'col-auto'}, c(Workspace)), // d-flex flex-column
        ]
    }else{
        return [
            panel_mode && c(Col, {xs:'3', className:'border-end', style:{maxHeight:height, overflow:'auto'}}, c(Panel)), // d-flex flex-column
            c(Col, {xs:panel_mode ? '9' : '12'}, c(Workspace)), // d-flex flex-column
        ]
    }
}

export function Workspace(){
    const studio_mode = use_store(d=> d.studio.mode);
    if(studio_mode == 'code'){
        return c(Code);
    }else if(studio_mode == 'repo'){
        return c(Repo);
    }else{
        return c(Canvas_Box);
    }
}


function Canvas_Box(){
    const cursor = use_store(d=> d.studio.cursor);
    const [window_width] = use_window_size();
    const panel_mode = use_store(d=> d.studio.panel.mode);
    //const {camera, size:{width, height}} = useThree();
    let marginLeft = 0;
    if(panel_mode) marginLeft = window_width * -.225;
    const width = window_width - 52;
    return(
        //c('p', {}, 'hello world')
        //c('div', {name:'r3f', className: cursor+' position-absolute start-0 end-0 top-0 bottom-0', style:{zIndex:-1}},
        //c('div', {name:'r3f', className: 'flex-grow-1 '+cursor, style:{zIndex:-1}},
        //c(Row, {
            //className: 'flex-grow-1 '+cursor, 
        //},
        c('div', {style:{
            position:'relative', 
            width: width + 'px', 
            height: '100%',
            marginLeft,
        }}, 
            c(Canvas,{
                className: cursor, 
                orthographic: true, 
                camera: {far:10000}, 
                //gl: {antialias: false},
                dpr: Math.max(window.devicePixelRatio, 2), //[2, 2], 
                frameloop: 'demand',
                // onClick(e){
                //     console.log('canvas click!!!');
                // },
                //, far:10000 zoom:1    //frameloop:'demand', 
            }, 
                c(Viewport),
            ),
            // c(Button, {
            //     className: 'position-absolute top-0 end-0',
            //     onClick(e){
            //         const d = get_store();
            //         console.log(d.scene.getObjectByName('graph'));
            //         const aabb = new Box3().setFromObject(d.scene.getObjectByName('graph'));
            //         // const zoom = Math.min(
            //         //     width / (aabb.max.x - aabb.min.x),
            //         //     height / (aabb.max.y - aabb.min.y)
            //         // );
            //         console.log('width', width);
            //         console.log('box', aabb);
            //         const zoom = width / (aabb.max.x - aabb.min.x);
            //         console.log('zoom', zoom);
            //         d.camera_controls.zoomTo(zoom);
            //         //camera.updateProjectionMatrix();
            //     },
            // },
            //     ' Fit View'
            // )
        )

    )
}



// // function Get_Schema(){
// //     const {data, status} = use_query('Schema', [ 
// //         ['schema data'],
// //     ],{onCompleted:result=>{
// //         //console.log('Get Schema - Complete', data.schema.full);    
// //         rs(d=>{
// //             try{
// //                 d.receive_schema(d, JSON.parse(result.schema.data))
// //             }catch(e){
// //                 console.log('receive_schema Error', e);
// //             }
// //         });
// //     }}); 
// //     return false;
// // }

// function Open_Push_Close(){
//     const ready = useS(d=> d.studio.ready);
//     const search = useS(d=> d.search);

//     const open_pack = use_mutation('OpenPack', [  
//         ['openPack pack{ data }',  
//             ['Int depth', search.depth], 
//             ['[ID] ids', search.ids], 
//             ['[[String]] include', null], 
//             ['[[String]] exclude', null]
//         ]  
//     ],{onCompleted:result=>{
//         console.log('Open Pack - complete');
//         console.log(Date.now()/1000 - 1685555000);
//         //if(result.openPack.pack) 
//         rs(d=>{
//             try{
//                 d.receive_triples(d, JSON.parse(result.openPack.pack.data).list); 
//             }catch(e){
//                 console.log('receive_triples Error', e);
//             }
//         });
//         //console.log(data);
//         //console.log(useS.getState().n);
//     }}); 
//     useEffect(()=>{
//         if(ready && Object.keys(gs().n).length < 1) {
//             console.log('Open Pack - mutate');
//             console.log(Date.now()/1000 - 1685555000);
//             open_pack.mutate();
//         }
//     },[ready]);
//     const push_pack = use_mutation('PushPack', [
//         ['pushPack reply', 
//             ['String triples', null],
//             ['String clientInstance', client_instance],
//         ],
//     ],{onCompleted:result=>{
//         console.log('Push Pack - complete: ', result.pushPack.reply);
//     }});
//     // merge with push_pack ?!?! Or make delete_pack and keep all types of ops seperate?
//     const close_pack = use_mutation('ClosePack', [['closePack reply', 
//         ['[ID] p', null], ['[ID] b', null], ['[ID] i', null], ['[ID] f', null], ['[ID] s', null],
//     ]],{onCompleted:result=>{ 
//         console.log('Close Pack - complete');
//         //console.log(data.closePack.reply);
//     }}); 
//     useEffect(()=>{
//         ss(d=> d.open_pack = open_pack.mutate);//d.set(d=> {d.open_pack = open_pack.mutate;});
//         ss(d=> d.push_pack = push_pack.mutate);//d.set(d=> {d.push_pack = push_pack.mutate;});
//         ss(d=> d.close_pack = close_pack.mutate);//d.set(d=> {d.close_pack = close_pack.mutate;});
//     },[]);
//     //console.log('studio render');
//     return null;
// }

// function Poll(){ // appears to be a bug where the server doesn't always catch changes so doesn't deliver in poll pack?
//     //const merge = useD(d=> d.merge);
//     // const cycle_poll = use_mutation('Cycle_Poll', [  
//     //     ['cyclePoll reply'] 
//     // ]); 
    
//     use_query('PollPack', [ // rerenders this component on every poll
//         ['pollPack p{id t} '+edges+' '+atoms+ ' dp db di df ds', ['String instance', instance]], //['pollPack p{id t} '+edges+' '+atoms, ['String instance', instance]], //['pollPack p{ id t{v} e{t{v}r{id}} u{id} '+edges+' } '+atoms, ['String instance', instance]],
//         //['deletePack p{id t} '+atoms, ['String instance', instance]] //['deletePack p{id} b{id} i{id} f{id} s{id}', ['String instance', instance]]
//     ],{notifyOnNetworkStatusChange:true, pollInterval: 1000, onCompleted:(data)=>{ //fetchPolicy:'no-cache',
//         //if(data.pollPack) console.log(data.pollPack);
//         if(data.pollPack) {
//             if(data.pollPack) console.log('poll pack recieved', data.pollPack);
//             //if(data.deletePack && data.deletePack.p.length > 0) console.log('delete pack part recieved', data.deletePack.p);
//             //console.log(data.pollPack.s.find(s=> s.v==instance));
//             rs(d=> d.receive_triples(d, data.pollPack)); // do not read anything older than when loader!!!!!!!
//         }
//         //if(data.deletePack) rs(d=> d.receive_instance_deleted(d, data.deletePack) ); 
//         //cycle_poll.mutate(); // very bad because the server might actually clear poll right after it gets new content and then never sends it on next request
//     }}); 
//     return null;
// }





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