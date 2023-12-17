import {createElement as c} from 'react';
//import {Container, Row, Col, Nav, Navbar, ToggleButton, InputGroup, Form} from 'react-bootstrap';//'boot';
import {Outlet} from 'react-router-dom';
import {Login, show_login, Logout, show_logout} from './login.js';
//import {Copy_Project, Delete_Project} from './studio/crud.js'
import {Logo} from './logo.js';
import { Confirm } from './confirm.js';
import {set_store, commit_store, use_store, use_query, 
        pointer, use_mutation, Node_Badge, readable, Token} from 'delimit';
import {animated, useSpring} from '@react-spring/web';
import {Vector2} from 'three';

const vector = new Vector2();

export function Root(){
    //const mode      = use_store(d=> d.mode);
    //const theme_mode = use_store(d=> d.theme.mode);
    //const studio_mode = use_store(d=> d.studio.mode);
    //const navigate = useNavigate();
    // const [window_width] = use_window_size(); 
    // const buttons = [
    //     {name:'Shop',  icon:'bi-bag',  value:'shop'},
    //     {name:'Studio', icon:'bi-palette2', value:'studio'}, 
    // ];
    //const render_root_header = () => null;
    const render_header = (render_outlet_header = () => null) => 
        c('div',{
            className:'position-absolute top-0 start-0 z-1 ms-1 mt-1', 
        },
            c(Logo),
            c('span', {className:'me-4'}),
            render_outlet_header(),
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
                commit_store(d=>{
                    if(Object.keys(d.drag.data).length) return;// 'cancel'; // could just check if anything actually changed
                    const data = d.drag.staged;
                    if(!e.ctrlKey || !data.root || !data.term) return; //  || data.index == null
                    //const placeholder = data.stem ? data.stem.type ? true : d.node.get(data.stem).forw.size : false;
                    d.drop.edge(d, {...data}); // stem:data.stem
                });
                set_store(d=>{
                    if(Object.keys(d.drag.data).length) return;
                    const data = d.drag.staged;
                    if(e.ctrlKey){
                        d.drag.data = data;
                    }else{
                        d.drag.data = {stem:data.stem};
                    }
                });
            },
            onPointerUp(e){
                pointer.dragging = false;
                set_store(d=>{
                    d.drag.data = {};
                });
            },
        },
            c('div',{
                className: 'z-1 position-absolute top-0 end-0 d-inline-flex', 
            },
                Token({
                    name: 'dark_mode',
                    icon: 'bi-moon',
                    active: d => d.theme.mode == 'dark',
                    action: d => d.theme.toggle(d),
                }),
                c(Account_Menu),
            ),
            c(Outlet, {context:{render_header}}),
            c(Drag),
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
        ].map(button => Token({group:'account', ...button}));
    return Token({
        name: 'Sign In', 
        icon: 'bi-box-arrow-in-right', 
        onClick: () => show_login(true),
    });
}

function Mutations(){
    const [shut_repo] = use_mutation('ShutRepo', {refetchQueries:['GetRepo']});
    const [drop_repo] = use_mutation('DropRepo', {refetchQueries:['GetRepo']});
    const [shut_node] = use_mutation('ShutNode');
    const [drop_node] = use_mutation('DropNode',{
        onCompleted:data=>{
            console.log(data.dropNode.reply);
        },
    });
    const [push_node] = use_mutation('PushNode',{
        onCompleted:data=>{
            console.log(data.pushNode.reply);
        },
    });
    set_store(d=>{ 
        d.mutation = {
            shut_repo,
            drop_repo,
            shut_node,
            drop_node,
            push_node,
        };
    });
}

function Drag(){
    //console.log('render drag');
    const {root, term, stem} = use_store(d=> d.drag.data);
    //const {title, icon} = use_store(d=> d.face.primary(d, node));
    //const root_face = use_store(d=> d.face.primary(d, root));
    const [springs, api] = useSpring(() => ({x:0, y:0}));
    pointer.spring = api;
    if(!root && !stem) return;
    const content = () => stem ? c(Node_Badge, {node:stem}) : readable(term);
    const root_content = () => ['Removed from', c(Node_Badge, {node:root})];
    return(
        c(animated.div,{
            style:{
                position: 'absolute',
                zIndex: 1000,
                ...springs,
            },
        },
            Token({content}),
            root && Token({content:root_content, className:'ps-4'}),
        )
    )
}


// stem ? c(Node_Badge, {node:stem}) : c(InputGroup.Text, {}, readable(term)),
// root && c(InputGroup, {className:'ps-4'},
//     c(InputGroup.Text, {}, 'Removed from'),
//     c(Node_Badge, {node:root}),
// ),


// c(ToggleButton,{
//     id: 'dark_mode_button',
//     type:'checkbox', variant:'outline-primary', 
//     checked: theme_mode=='dark',
//     className: 'border-0 bi-moon rounded-4 rounded-top-0',
//     onChange:e=> set_store(d=> d.theme.toggle_mode(d)),
// }),

// function Account_Button({button}){
//     //const [window_width] = use_window_size();
//     return( 
//         c(Button,{
//             group: 'account',
//             name: button.name(),
//             css_cls: button.icon,
//             onClick: e => button.func(),
//             //className: 'border-0 '+button.icon,
//             //variant: 'outline-primary', 
//             //onClick:e=> button.func(),
//         }, 
//             //window_width > 576 ? ' '+button.name() : ''
//         )
//     )
// }



// return (
//     //c(Row,{className:''},
    
//         // c(Container,{
//         //     fluid: true,
//         //     className: 'h-100 g-0',
//         // },
//         //c(Row, {},
//         c(Col, {
//             className:'d-flex flex-column',
//             onPointerMove(e){ // Capture  
//                 pointer.spring.set({x:e.clientX+10, y:e.clientY+10});
//                 pointer.position.set(e.clientX, e.clientY);
//                 if(!pointer.dragging) return; 
//                 if(vector.copy(pointer.position).sub(pointer.start).length() < 10) return;
//                 commit_store(d=>{
//                     if(d.drag.data.stem) return;// 'cancel'; // could just check if anything actually changed
//                     const data = d.drag.staged;
//                     if(!e.ctrlKey || !data.root || !data.term || data.index == null) return;
//                     const placeholder = data.stem.type ? true : d.node.get(data.stem).forw.size;
//                     d.drop.edge(d, {...data, placeholder}); // stem:data.stem
//                 });
//                 set_store(d=>{
//                     if(d.drag.data.stem) return;
//                     const data = d.drag.staged;
//                     if(e.ctrlKey){
//                         d.drag.data = data;
//                     }else{
//                         d.drag.data = {stem:data.stem};
//                     }
//                 });
//             },
//             onPointerUp(e){
//                 pointer.dragging = false;
//                 set_store(d=>{
//                     d.drag.data = {};
//                 });
//             },
//         }, 
//             c(Drag),
//             c(Login),
//             c(Logout),
//             c(Confirm),
//             c(Row, {}, 
//                 c(Col, {className:'col-auto ms-1 mt-1',
//                     role: 'button',
//                     onClick:e=> set_store(d=>{
//                         d.mode = '/';
//                         navigate(d.mode);
//                     }),
//                 }, 
//                     c(Logo, {height:32}),
//                 ),
//                 c(Col, {},
//                     // buttons.map((button,i)=>
//                     //     c(ToggleButton,{
//                     //         id: 'mode'+i,
//                     //         className: button.icon + ' border-0 rounded-4 rounded-top-0',
//                     //         type: 'radio',
//                     //         variant: 'outline-primary', //size: 'lg',
//                     //         value: button.value,
//                     //         checked: mode == button.value,
//                     //         onChange:e=> set_store(d=>{
//                     //             d.mode = e.currentTarget.value;
//                     //             navigate(d.mode);
//                     //         }),
//                     //     }, 
//                     //         window_width > 576 ? ' '+button.name : '',
//                     //     )
//                     // ),
//                     mode=='studio' && [
//                         c(Mode_Bar),
//                         c('span', {className:'me-4'}), 
//                         c(History),
//                     ],
//                 ),
//                 //mode=='studio' && c(Col, {}, c(Mode_Bar)),
//                 c(Col, {className:'col-auto'},
//                     c(ToggleButton,{
//                         id: 'dark_mode_button',
//                         type:'checkbox', variant:'outline-primary', 
//                         checked: theme_mode=='dark',
//                         className: 'border-0 bi-moon rounded-4 rounded-top-0',
//                         onChange:e=> set_store(d=> d.theme.toggle_mode(d)),
//                     }),
//                     c(Account_Menu),
//                     c(Mutations),
//                     // !data ? status && c(status) : 
//                     //     data.user ? account_buttons.map((button,i)=> c(Account_Button, {button}))
//                     //     : c(Account_Button, {button:{name:()=>'Sign In', icon:'bi-box-arrow-in-right', func:()=> show_login(true)}}),
//                 ),
//             ),
//             c(Row, {className:'flex-grow-1'},  
//                 c(Outlet),
//             ),
//         )//,
//     //)
//   )



            // stem.type == 'xsd:boolean' ?
            //         c(Form.Check, {
            //             className: 'flex-grow-1 ms-2 mt-2', 
            //             type: 'switch',
            //             checked: stem.value, 
            //         }) :
            //         //c(InputGroup.Text, {className:'text-body'}, stem.value) :




// data.user ? 
//                                 account_buttons.map((button,i)=>
//                                     c(Button,{
//                                         className: 'border-0 '+button.icon,
//                                         variant: 'outline-primary', 
//                                         onClick:e=> button.func(),
//                                     }, window_size.width > 576 ? ' '+button.name() : '')
//                                 )
//                             : 
//                                 c(Button,{
//                                     className: 'border-0 bi-box-arrow-in-right',
//                                     variant: 'outline-primary', 
//                                     onClick: e=> show_login(true),
//                                 }, window_size.width > 576 ? ' Sign In' : '')

// !data ? status && c(status) : 
//                             data.user ? c(Fragment,{},
//                                 c(Nav.Link, {id:'root_account', eventKey:3, className:''}, 'Account ('+data.user.firstName+')'),
//                                 c(Nav.Link, {id:'root_logout', onClick:()=>show_logout(true), eventKey:4, className:' bi-box-arrow-left'}, ' Sign Out'), //, c('i',{className:'bi-box-arrow-left'})
//                             ): 
//                                 c(Nav.Link, {id:'root_login', onClick:()=>show_login(true), eventKey:5, className:' bi-box-arrow-in-right'}, ' Sign In'), //c('i',{className:'bi-box-arrow-in-right'})


// c(Col, {},
                    //     //c(Nav.Link, {as:Link, to:'catalog', eventKey:1, className:''}, 'Store'),
                    //     //c(Nav.Link, {as:Link, to:'studio', eventKey:2, className:''},  'Studio'),
                    // ),

			//c(Copy_Project),
			//c(Delete_Project),


// c(Navbar, {expand:'lg', collapseOnSelect:true},  // bg:'white', 
// c(Container,{fluid:true, className:'ps-4 pe-4'},
//       c(Navbar.Brand, {style:{cursor:'pointer'}, as:Link, to:'/'}, 
//         c(Logo, {height:40}),
//       ),
//     c(Navbar.Toggle, {ariacontrols:"basic-navbar-nav"}),
//       c(Navbar.Collapse, {id:"basic-navbar-nav"},
//         c(Nav, {className:"me-auto"},
//               c(Nav.Link, {as:Link, to:'catalog', eventKey:1, className:'ms-auto'}, 'Catalog'),
//               c(Nav.Link, {as:Link, to:'studio', eventKey:2, className:'ms-auto'},  'Studio'),
//         ),
//         c(Nav, {className:"me-2"},
//             !data ? status && c(status) :
//                 data.user ? c(Fragment,{},
//                     c(Nav.Link, {id:'root_account', eventKey:3, className:'ms-auto'}, 'Account ('+data.user.firstName+')'),
//                     c(Nav.Link, {id:'root_logout', onClick:()=>show_logout(true), eventKey:4, className:'ms-auto bi-box-arrow-left'}, ' Sign Out'), //, c('i',{className:'bi-box-arrow-left'})
//                 ): 
//                     c(Nav.Link, {id:'root_login', onClick:()=>show_login(true), eventKey:5, className:'ms-auto bi-box-arrow-in-right'}, ' Sign In'), //c('i',{className:'bi-box-arrow-in-right'})
//         ),
//       ),
// )
// ),




// const [Login_Modal, open_login, close_login] = use_modal();


//import {makeVar, useReactiveVar, useQuery, gql} from 'apollo';

//const user = useReactiveVar(user_state);
	// const firstName = `firstName`;
	//const {loading, error, data} = useQuery(gql`query{ 
    //    user {
    //        firstName
    //    }
    //}`, {variables:{},fetchPolicy:'no-cache'});
	//if (loading) return r(Loading);
    //if (error)   return r(Error_Page);

//import {useStore} from 'easel/init.js'
//import {Nav} from 'boot';
//import {Navbar} from 'boot';
//import NavDropdown from 'boot/NavDropdown'; 

//const nav = JSON.parse(document.getElementById('nav').innerHTML); 

//console.log(dd.theme);



                //...nav.main.map((n,i)=>r(Nav.Link, {onClick:()=>page_var(n.name),key:i},n.name)),//r(Button, {text:n.name, func:()=>page_var(n.name), key:i} )),//r(Nav.Link, {key:i, href:item.url},item.name)),
  //         <NavDropdown title="Dropdown" id="basic-nav-dropdown">
  //           <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
  //           <NavDropdown.Item href="#action/3.2">
  //             Another action
  //           </NavDropdown.Item>
  //           <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
  //           <NavDropdown.Divider />
  //           <NavDropdown.Item href="#action/3.4">
  //             Separated link
  //           </NavDropdown.Item>
  //         </NavDropdown>