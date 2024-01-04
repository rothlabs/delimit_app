import {createElement as c} from 'react';
//import {Container, Row, Col, Nav, Navbar, ToggleButton, InputGroup, Form} from 'react-bootstrap';//'boot';
import {Outlet} from 'react-router-dom';
import {Login, show_login, Logout, show_logout} from './login.js';
//import {Copy_Project, Delete_Project} from './studio/crud.js'
import {Logo} from './logo.js';
import { Confirm } from './confirm.js';
import {set_store, act_store, use_store, use_query, 
        pointer, use_mutation, render_badge, readable, render_token} from 'delimit';
import {animated, useSpring} from '@react-spring/web';
import {Vector2} from 'three';

const vector = new Vector2();

export function Root(){
    const render_header = (render_outlet_header = () => null) => 
        c('div',{
            className:'position-absolute top-0 start-0 end-0 ms-1 mt-1 z-1', 
        },
            c('div', {className:'position-absolute'},
                c(Logo),
            ),
            c('div', {className:'ms-5 ps-5'},
                render_outlet_header(),
            ),
        );
    return(
        c('div', {
            id: 'root', 
            className: 'vh-100',
            onPointerMove(e){ // Capture  
                pointer.spring.set({x:e.clientX+10, y:e.clientY+10});
                pointer.position.set(e.clientX, e.clientY);
                if(!pointer.dragging) return; 
                if(vector.copy(pointer.position).sub(pointer.start).length() < 10) return;
                act_store(d=>{
                    if(Object.keys(d.drag.edge).length) return;
                    const edge = d.drag.staged;
                    if(!e.ctrlKey || !edge.root || !edge.term) return; 
                    d.drop.edge(d, edge); 
                });
                set_store(d=>{
                    if(Object.keys(d.drag.edge).length) return;
                    const edge = d.drag.staged;
                    if(e.ctrlKey) d.drag.edge = edge;
                    else d.drag.edge = {stem:edge.stem};
                });
            },
            onPointerUp(){
                pointer.dragging = false;
                set_store(d=> d.drag.edge = {});
            },
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
            c(Mutations),
        )
    );
} 

function Account_Menu(){
    const {data, loading, error} = use_query('GetUser', {onCompleted:data=>{
        try{ set_store(d=> d.user_id = data.user.id); }
        catch(e){ console.log('Error fetching user info'); }
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

function Mutations(){
    const [make_nodes] = use_mutation('MakeNodes', {
        onCompleted:data=>{
            console.log(data.makeNodes.reply);
        },
    });
    const [drop_nodes] = use_mutation('DropNodes',{
        onCompleted:data=>{
            console.log(data.dropNodes.reply);
        },
    });
    const [close_nodes] = use_mutation('CloseNodes', {
        onCompleted:data=>{
            console.log(data.closeNodes.reply);
        },
    });
    const [edit_repo] = use_mutation('EditRepo', {
        refetchQueries:['GetRepo'],
        onCompleted:data=>{
            console.log(data.editRepo.reply);
        },
    });
    const [drop_repo] = use_mutation('DropRepo', {
        refetchQueries:['GetRepo']
    });
    const [close_repo] = use_mutation('CloseRepo', {
        refetchQueries:['GetRepo']
    });
    const [edit_version] = use_mutation('EditVersion', {
        refetchQueries:['GetRepo'],
        onCompleted:data=>{
            console.log(data.editVersion.reply);
        },
    });
    set_store(d=>{ 
        d.server = {
            make_nodes,
            drop_nodes,
            close_nodes,
            edit_repo,
            drop_repo,
            close_repo,
            edit_version,
        };
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