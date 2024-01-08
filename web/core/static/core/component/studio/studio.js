import {createElement as c} from 'react';
import {Canvas} from '@react-three/fiber';
import {
    use_store, undo, redo, render_token, icons, draggable, pickable, snake_case, render_badge, act_on_store_without_history, 
    Mode_Menu,
    Make_Node, Make_Repo, Node_Editor, Schema, Repo_Editor,  
    Repo_Browser, Code_Editor, Viewport,
} from 'delimit';
import {useOutletContext} from 'react-router-dom';
import {animated, useTransition} from '@react-spring/web';

export function Studio(){
    const {render_header} = useOutletContext();
    return[
        render_header(() => 
            c('div', {className:'position-relative d-flex gap-5',},
                c('div', {className:'position-relative d-flex mt-1'}, 
                    Mode(),
                ),
                c('div', {className:'position-absolute end-0 d-flex', style:{marginRight:200}},
                    History(),
                )
            ),
        ),
        c('div', {className:'position-absolute start-0 end-0 top-0 bottom-0'},
            c(Canvas_3D),
        ),
        c(Topic),
        c('div', {className:'z-1 position-absolute top-0 start-0 ms-1 mt-5 pt-2'},
            c('div', {className:'position-relative d-flex flex-column'}, 
                c(Panel_Mode),
            ),
        ),
        c('div', {id:'panel', className:'z-1 position-absolute top-0 start-0 mt-5 ms-5 ps-3 pt-1'}, // 90vh put scroll bar crap here ?! #1
            c(Panel),
        ),
        c('div', {className:'z-1 position-absolute bottom-0 start-0 d-flex flex-column ms-1 mb-1'},
            c(Leaf_Bar),
        ),
        c('div', {className:'z-1 position-absolute start-0 bottom-0 ms-5 mb-1 ps-1'},
            c(Term_Editor),
        ),
        c('div', {className: 'z-1 position-absolute bottom-0 end-0 mb-1 me-1'},
            c(Node_Action_Menu),
        ),
        c('div', {className: 'z-1 position-absolute bottom-0 end-0 mb-1 me-1'},
            c(Repo_Action_Menu),
        ),
        c('div', {className: 'z-1 position-absolute bottom-0 end-0 mb-1 me-1'},
            c(Version_Action_Menu),
        ),
        c('div', {className:'z-1 position-absolute start-50 bottom-0 translate-middle-x mb-1'},
            c(Targeted_Version),
        ),
    ]
}

function Term_Editor(){
    const {root, term} = use_store(d=> d.get.picked_context(d));
    const content = ({render_name, render_input}) => [
        render_badge({node:root}),
        render_name({}),
        render_input({
            value: term,
            store_action: (d,e) => d.set_term(d, {root, term, new_term:snake_case(e.target.value)}),
        }),
    ];
    if(!root || !term) return;
    return render_token({name:'Term', content, style:{borderRight:'thick solid var(--bs-secondary)'}});
}

function Targeted_Version(){
    const version = use_store(d=> d.get.targeted.version(d));
    const repo = use_store(d=> d.get.version.repo(d, version));
    if(!version) return;
    return render_token({
        icon: 'bi-fullscreen-exit',
        name: 'Target',
        ...pickable({item:{version}, mode:'secondary'}),
        content: ({render_token_badge}) => [
            render_token_badge(),
            render_badge({repo}),
            render_badge({version}),
        ],
        store_setter: d => {
            d.studio.panel.mode = 'repo_editor';
            d.inspect.open(d, {path:repo});
        },
    });
}

function Action_Menu({open, group, items}){
    const transition = useTransition(open, {
        from:  {x:'125%'}, 
        enter: {x:'0%'},    
        leave: {x:'125%'}, 
    });
    return transition((style, item) => item && c(animated.div, {
        style: {...style, borderRight:'thick solid var(--bs-secondary)'},
    }, items.map(item => 
        c('div', {className:'d-flex justify-content-end'},
            render_token({...item, group, hide_secondary_pick:true})
        )
    )))
} 
function Node_Action_Menu(){
    const prm_nodes = use_store(d=> [...d.picked.primary.node]);
    const nodes = use_store(d=> [...d.picked.secondary.node]);
    return c(Action_Menu, {open:(nodes.length > 0), group:'node_action_menu', items:[
        //root && term && {name:'Term', content:render_term_content},
        {name:'Copy', icon:'bi-file-earmark', store_action:d=> d.copy.node(d, {nodes})},
        {name:'Copy', icon:'bi-file-earmark-fill', store_action:d=> d.copy.node(d, {nodes, deep:true})},
        (prm_nodes[0] && prm_nodes[0] != nodes[0]) 
            && {name:'Replace', icon:'bi-repeat', store_action:d=> d.replace.node(d, {nodes, source:prm_nodes[0]})},
        {name:'Roots', icon:'bi-arrow-left-circle', store_setter:d=> d.pick_back(d, {nodes})},
        {name:'Delete', icon:'bi-trash2', store_action:d=> d.drop.node(d, {nodes})},
        {name:'Deep Delete', icon:'bi-trash2-fill', store_action:d=> d.drop.node(d, {nodes, deep:true})},
    ]})
}
function Repo_Action_Menu(){
    const repo = use_store(d=> d.picked.secondary.repo.keys().next().value);
    const name = use_store(d=> d.get.repo.name(d, repo));
    const version = use_store(d=> d.get.repo.main_version(d, repo));
    return c(Action_Menu, {open:(repo != null), group:'repo_action_menu', items:[
        {name, content:render_badge({repo}), store_setter:d=> d.pick(d, {item:{version}})},
        {name:'Close',   icon:'bi-x-lg', store_action:d=> d.close.repo(d, {repo})},
        {name:'Delete',  icon:'bi-trash2', store_setter:d=> d.confirm = {
            title: `Delete: ${name}`,
            body: `All data will be irreversibly destroyed in ${name} (repository). Proceed with caution.`,
            func:()=> act_on_store_without_history(d=> d.drop.repo(d, {repo})),
        }},
    ]})
}
function Version_Action_Menu(){
    const version = use_store(d=> d.picked.secondary.version.keys().next().value);
    const name = use_store(d=> d.get.version.name(d, version));
    const repo = use_store(d=> d.get.version.repo(d, version));
    const repo_name = use_store(d=> d.get.repo.name(d, repo));
    //const targeted = use_store(d=> d.get.targeted.version(d));
    return c(Action_Menu, {open:(version != null), group:'version_action_menu', items:[
        {name, content:[render_badge({repo}), render_badge({version})], ...pickable({item:{version}, mode:'primary'})},
        //(version != targeted) && {name:'Target', icon:'bi-fullscreen-exit', store_setter:d=> d.pick(d, {item:{version}})},
        {name:'Commit', icon:'bi-bookmark', store_setter:d=> d.commit.version(d, {version})},
        {name:'Close', icon:'bi-x-lg', store_action:d=> d.close.version(d, {version})},
        {name:'Delete', icon:'bi-trash2', store_setter:d=> d.confirm = {
            title: `Delete: ${name}`,
            body: `All data will be irreversibly destroyed in ${name} (version) of ${repo_name} (repository). Proceed with caution.`,
            func:()=> act_on_store_without_history(d=> d.drop.version(d, {version})),
        }},
    ]})
}

export function Mode(){
    return c(Mode_Menu, {
        group: 'studio_mode',
        items:[
            {mode:'repo',  icon:'bi-journal-bookmark'}, 
            {mode:'graph', icon:'bi-diagram-3'},
            {mode:'scene', icon:'bi-pencil-square'}, 
            {mode:'code',  icon:'bi-braces'},
        ], 
        width: 110, 
        state: d => d.studio.mode,
        store_setter: (d, mode) => d.studio.mode = mode,
    })
}

function History(){
    return c('div', {className:'d-flex'}, [
        {name:'Undo', onClick:()=>undo(), icon:'bi-arrow-left'},
        {name:'Redo', onClick:()=>redo(), icon:'bi-arrow-right'},
    ].map(item => render_token({group:'history', ...item})))
}

export function Panel_Mode(){
    return c(Mode_Menu, {
        group: 'panel_mode',
        items:[
            {mode:'node_editor', icon:'bi-box'}, 
            {mode:'make',        icon:'bi-plus-square'},
            {mode:'schema',      icon:'bi-ui-checks'},
            {mode:'repo_editor', icon:'bi-journal-bookmark'},
            {mode:'display',     icon:'bi-eye'}, 
        ], 
        state: d => d.studio.panel.mode,
        store_setter: (d, mode) => d.studio.panel.mode = mode,
    });
}

export function Leaf_Bar(){
    //console.log('render panel bar');
    return [
        {name:'Decimal', stem:{type:'decimal', value:0}},
        {name:'Integer', stem:{type:'integer', value:0}},
        {name:'String',  stem:{type:'string',  value:'New'}},
        {name:'Boolean', stem:{type:'boolean', value:true}},
    ].map(({name, stem}) => render_token({group:'new_leaf', name,
        icon: icons.css.cls[stem.type],
        ...draggable({stem}),
    }))
}

function Panel(){ 
    const studio_mode = use_store(d=> d.studio.mode);
    const mode = use_store(d=> d.studio.panel.mode);
    if(mode == 'make'){
        if(studio_mode == 'repo') return c(Make_Repo);
        return c(Make_Node);
    }
    if(mode == 'node_editor') return c(Node_Editor);
    if(mode == 'schema')      return c(Schema);
    if(mode == 'repo_editor') return c(Repo_Editor);
}

export function Topic(){
    const studio_mode = use_store(d=> d.studio.mode);
    if(studio_mode == 'code'){
        return c('div', {className: 'position-absolute end-0 bottom-0'},
            c(Code_Editor),
        )
    }else if(studio_mode == 'repo'){
        return c('div', {className:'position-absolute start-0 end-0 top-0 bottom-0 overflow-y-auto'},
            c('div', {className:'position-absolute top-0 start-50 translate-middle-x my-4 py-5'},
                c(Repo_Browser),
            )
        )
    }
}

function Canvas_3D(){
    const cursor = use_store(d=> d.studio.cursor);
    return c(Canvas,{
        className: cursor,// + ' bg-primary-subtle', 
        orthographic: true, 
        camera: {far:10000}, //gl: {antialias: false},
        dpr: Math.max(window.devicePixelRatio, 2), //[2, 2], 
        frameloop: 'demand',
    }, 
        c(Viewport),
    )
}




            // c('div', {className:'d-inline-flex w-100 h-100'}, // , style:{width:'100%'} 
            //     c('div', {className: 'flex-grow-1'}, // className:''
            //         c(Panel),
            //     ),
            //     studio_mode=='code' && c('div', {
            //         id: 'code_editor_container',
            //         className: 'mt-2', 
            //     },
            //         c(Code_Editor),
            //     )
            // ),


// function Node_Action_Menu(){
//     const prm_nodes = use_store(d=> [...d.picked.primary.node]);
//     const nodes = use_store(d=> [...d.picked.secondary.node]);
//     const transition = useTransition((nodes.length > 0), action_menu_transition_config);
//     return transition((style, item) => item && c(animated.div, {
//         className: 'd-flex flex-column',
//         style: {...style, borderRight:'thick solid var(--bs-secondary)'},
//     },[
//         (prm_nodes[0] && prm_nodes[0] != nodes[0]) 
//             && {name:'Replace', icon:'bi-repeat', store_action:d=> d.replace(d, {source:prm_nodes[0], target:nodes[0]})},
//         {name:'Roots', icon:'bi-arrow-left-circle', store_action:d=> d.pick_back(d, {node:nodes[0]})},
//         {name:'Delete', icon:'bi-trash2', store_action:d=> d.drop.node(d, {nodes})},
//         {name:'Deep Delete', icon:'bi-trash2-fill', store_action:d=> d.drop.node(d, {nodes, deep:true})},
//     ].map(button => render_token({...button, group:'node_action_menu'}))))
// }

// function Repo_Action_Menu(){
//     const repo = use_store(d=> d.picked.secondary.repo.keys().next().value);
//     const name = use_store(d=> d.get.repo.name(d, repo));
//     const transition = useTransition((repo != null), action_menu_transition_config);
//     return transition((style, item) => item && c(animated.div, {
//         className: 'd-flex flex-column',
//         style: {...style, borderRight:'thick solid var(--bs-secondary)'},
//     },[
//         {name:'Close',   icon:'bi-x-lg', content:'badge', store_action:d=> d.close.repo(d, {repo})},
//         {name:'Delete',  icon:'bi-trash2', content:'badge', store_setter:d=> d.confirm = {
//             title: `Delete: ${name}`,
//             body: `All data will be irreversibly destroyed in ${name} repository. Proceed with caution.`,
//             func:()=> act_on_store(d=> d.drop.repo(d, {repo})),
//         }},
//     ].map(button => render_token({...button, group:'repo_action_menu'}))))
// }


// function Panel_Workspace(){
//     const studio_mode = use_store(d=> d.studio.mode);
//     const panel_mode = use_store(d=> d.studio.panel.mode);
//     //let [height] = use_window_size();
//     //height = height * .9 + '';
//     const height = '90vh';
//     // if(studio_mode == 'graph' || studio_mode == 'design'){
//     //     return [
//     //         panel_mode && c(Col, {
//     //             className:'border-end', 
//     //             style:{zIndex:1, backgroundColor:'var(--bs-body-bg)', maxHeight:height, overflow:'auto'}
//     //         }, c(Panel)), // d-flex flex-column
//     //         c(Col, {className:'col-auto'}, c(Workspace)), // d-flex flex-column
//     //     ]
//     // }else{
//         return [
//             panel_mode && c(Col, {xs:'3', className:'border-end', style:{maxHeight:height, overflow:'auto'}}, c(Panel)), // d-flex flex-column
//             c(Col, {xs:panel_mode ? '9' : '12'}, c(Workspace)), // d-flex flex-column
//         ]
//     //}
// }


    // const [window_width] = use_window_size();
    // const panel_mode = use_store(d=> d.studio.panel.mode);
    // //const {camera, size:{width, height}} = useThree();
    // let marginLeft = 0;
    // //if(panel_mode) marginLeft = window_width * -.225;
    // //const width = window_width - 52;

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
        //)

    // style:{
    //                         maxHeight: height,
    //                         overflow: 'auto',
    //                         //scrollbarColor: 'red orange',
    //                     },


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
//                 d.receive_data(d, JSON.parse(result.openPack.pack.data).list); 
//             }catch(e){
//                 console.log('receive_data Error', e);
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
//             rs(d=> d.receive_data(d, data.pollPack)); // do not read anything older than when loader!!!!!!!
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