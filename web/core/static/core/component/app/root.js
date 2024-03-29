import {createElement as c} from 'react';
import {Outlet} from 'react-router-dom';
import {Login, show_login, Logout, show_logout} from './login.js';
import {Logo} from './logo.js';
import {
    set_store, get_store, act_on_store, use_store, use_query, act_on_store_with_prep,
    controls, render_badge, readable, render_token,
    Confirm
} from 'delimit';
import {animated, useSpring} from '@react-spring/web';
import {Vector2, Vector3} from 'three';

const vector2 = new Vector2();
const vector3 = new Vector3();
const {pointer, projection} = controls;

export function Root(){
    const render_header = (render_outlet_header = () => null) => 
        c('div',{
            className:'position-absolute top-0 start-0 end-0 z-1', // ms-1 mt-1 
        },
            c('div', {className:'position-absolute ms-1 mt-1'},
                c(Logo),
            ),
            c('div', {className:'ms-5 ps-5'},
                render_outlet_header(),
            ),
        );
    return c('div', {
        id: 'root', 
        className: 'vh-100',
        //onPointerDown,
        onPointerMove,
        onPointerUp,
    },
        c(Outlet, {context:{render_header}}),
        c('div',{
            className: 'position-absolute top-0 end-0 d-flex mt-1 me-1 z-1', 
        },
            render_token({
                name: 'dark_mode',
                icon: 'bi-moon',
                active: d => d.theme.mode == 'dark',
                store_setter: d => d.theme.toggle(d),
            }),
            c(Account_Menu),
        ),
        c(Dragged),
        c(Login),
        c(Logout),
        c(Confirm),
    )
} 

// function onPointerDown(e){
//     console.log('pointer down');
//     pointer.start.set(e.clientX, e.clientY);
//     pointer.delta.set(0, 0, 0); 
// }

function onPointerMove(e){ // Capture  
    pointer.spring.set({x:e.clientX+10, y:e.clientY+10});
    pointer.position.set(e.clientX, e.clientY);
    pointer.delta.copy(pointer.position).sub(pointer.start); 
    if(pointer.delta.length() < 12 && !controls.dragging) return; // TODO: Detect tablet to make required delta larger
    if(controls.staged_drag_type == 'scene') drag_scene(e); 
    if(controls.staged_drag_type == 'edge')  drag_edge(e); 
}

function drag_scene(e){
    controls.dragging = 'scene';
    const d = get_store();
    if(d.tick > controls.drag.tick){
        controls.drag.resolve = () => resolve_drag_scene(e);
    }else{
        resolve_drag_scene(e);
    }
}

const drag_vec = new Vector3(0,0,0);
function resolve_drag_scene(e){
    controls.drag.resolve = () => null;
    set_store(d => {
        d.tick++; 
        const vec = drag_vec; // controls.scene.end;
        vec.set(
            (e.clientX / window.innerWidth) * 2 - 1,        
            -(e.clientY / window.innerHeight) * 2 + 1,
            projection.start.z,
        ).unproject(d.camera);
        vec.applyMatrix4(controls.drag.matrix).sub(controls.drag.start);
        const end = controls.scene.end;
        end.copy(controls.scene.start).add(vec);
        end.set(d.rnd(end.x), d.rnd(end.y), d.rnd(end.z));
        d.scene.set_source_position({scene:d.drag.staged.scene, position:end});
    });
}

function drag_edge(e){
    controls.dragging = 'edge';
    act_on_store(d=>{
        if(Object.keys(d.drag.edge).length) return;
        const {root, term, stem, index} = d.drag.staged;
        if(!e.ctrlKey || !root || !term) return;
        d.drop.edge(d, {root, term, stem, index}); 
    });
    set_store(d=>{
        if(Object.keys(d.drag.edge).length) return;
        const {root, term, stem, index} = d.drag.staged;
        if(e.ctrlKey) d.drag.edge = {root, term, stem, index};
        else d.drag.edge = {stem};
    });
}

function onPointerUp(){
    if(controls.dragging == 'scene'){
        act_on_store_with_prep({
            prep: d => d.scene.set_source_position({scene:d.drag.staged.scene, position:controls.scene.start}),
            act: d => d.scene.set_source_position({scene:d.drag.staged.scene, position:controls.scene.end}),
        });
    }
    if(controls.dragging == 'edge'){
        set_store(d=> d.drag.edge = {}); // if(Object.keys(d.drag.edge).length) d.drag.edge = {};
    }
    controls.staged_drag_type = null;
    setTimeout(() => controls.dragging = null, 50);
}

function Account_Menu(){
    const {data, loading, error} = use_query('GetUser', {onCompleted:data=>{
        // TODO: load user prefs?
    }});
    if(loading) return 'Loading';
    if(error) return `Error! ${error}`;
    //if(!data.user?.firstName) return 'Error fetching user info';
    if(data?.user) return [
        {name:'Account ('+data.user.firstName+')',  icon:'bi-person', onClick:()=>null},
        {name:'Sign Out', icon:'bi-box-arrow-left', onClick:()=> show_logout(true)}, 
        ].map(button => render_token({group:'account', ...button}));
    return render_token({
        name: 'Sign In', 
        icon: 'bi-box-arrow-in-right', 
        onClick: () => show_login(true),
    });
}

function Dragged(){
    //console.log('render drag');
    const {root, term, stem} = use_store(d=> d.drag.edge);
    const [springs, api] = useSpring(() => ({x:0, y:0}));
    pointer.spring = api;
    if(!root && !stem) return;
    return(
        c(animated.div,{
            style:{position:'absolute', zIndex:1000, ...springs},
        },
            render_token({content: stem ? render_badge({node:stem}) : readable(term)}),
            root && render_token({content:['Removed from', render_badge({node:root})]}), // className:'ps-4'
        )
    )
}




        // set_store(d => {
        //     d.scene.set_source_position({scene:d.drag.staged.scene, 
        //         position:vector3.copy(controls.scene.end).add(vector3_offset),
        //     });
        // });
        // act_on_store(d => {
        //     d.scene.set_source_position({scene:d.drag.staged.scene, position:controls.scene.end});
        // });

// function drag_scene(e){
//     controls.dragging = 'scene';
//     const d = get_store();
    
//     set_store(d => {
//         if(d.tick > controls.drag.tick) return;
//         d.tick++;
//         const pos = controls.scene.end;
//         pos.set(
//             (e.clientX / window.innerWidth) * 2 - 1,        
//             -(e.clientY / window.innerHeight) * 2 + 1,
//             projection.start.z,
//         ).unproject(d.camera);
//         pos.set(d.rnd(pos.x), d.rnd(pos.y), d.rnd(pos.z));
//         d.scene.set_source_position({scene:d.drag.staged.scene, position:pos});
//     });
// }





// c('div', {
//     id: 'root', 
//     className: 'vh-100',
//     onPointerMove(e){ // Capture  
//         pointer.spring.set({x:e.clientX+10, y:e.clientY+10});
//         pointer.position.set(e.clientX, e.clientY);
//         if(!pointer.dragging) return; 
//         if(vector2.copy(pointer.position).sub(pointer.start).length() < 10) return;
//         act_on_store(d=>{
//             if(Object.keys(d.drag.edge).length) return;
//             const edge = d.drag.staged;
//             if(!e.ctrlKey || !edge.root || !edge.term) return; 
//             d.drop.edge(d, edge); 
//         });
//         set_store(d=>{
//             if(Object.keys(d.drag.edge).length) return;
//             const edge = d.drag.staged;
//             if(e.ctrlKey) d.drag.edge = edge;
//             else d.drag.edge = {stem:edge.stem};
//         });
//     },
//     onPointerUp(){
//         pointer.dragging = false;
//         set_store(d=> d.drag.edge = {});
//     },
// },