import {createElement as c, Fragment, useEffect} from 'react';
import {Container, Row, Col, Nav, Navbar, ToggleButton, InputGroup, Button} from 'react-bootstrap';//'boot';
import {Outlet, Link, useNavigate} from 'react-router-dom';
import {Login, show_login, Logout, show_logout} from './login.js';
//import {Copy_Project, Delete_Project} from './studio/crud.js'
import {Logo} from './logo.js';
import {Mode_Bar} from '../studio/mode_bar.js';
import { Confirm } from './confirm.js';
import {set_store, commit_store, use_store, use_query, use_window_size, Svg, pointer} from 'delimit';
import {animated, useSpring} from '@react-spring/web';
import {Vector2} from 'three';

const vector = new Vector2();

function Drag(){
    //console.log('render drag');
    const {root, node} = use_store(d=> d.drag.data);
    const {title, icon} = use_store(d=> d.face.primary(d, node));
    const root_face = use_store(d=> d.face.primary(d, root));
    const [springs, api] = useSpring(() => ({x:0, y:0}));
    pointer.spring = api;
    if(!node) return;
    return(
        c(animated.div,{
            style:{
                position: 'absolute',
                zIndex: 1000,
                ...springs,
            },
        },
            c(InputGroup.Text, {className:'text-body'},
                c(Svg, {svg:icon, className:'me-1'}),
                title,
            ),
            root_face.title && root_face.icon && c(InputGroup, {className:'ps-4'},
                c(InputGroup.Text, {}, 'Removed from '),
                c(InputGroup.Text, {className:'text-body'},
                    c(Svg, {svg:root_face.icon, className:'me-1'}),
                    root_face.title,
                )
            ),
        )
    )
}

export function Root(){
    const mode      = use_store(d=> d.mode);
    const theme_mode = use_store(d=> d.theme.mode);
    //const studio_mode = use_store(d=> d.studio.mode);
    const navigate = useNavigate();
    const [window_width] = use_window_size(); 
    const buttons = [
        {name:'Shop',  icon:'bi-bag',  value:'shop'},
        {name:'Studio', icon:'bi-palette2', value:'studio'}, 
    ];
	return (
		//c(Row,{className:''},
		
            // c(Container,{
            //     fluid: true,
            //     className: 'h-100 g-0',
            // },
            //c(Row, {},
            c(Col, {
                className:'d-flex flex-column',
                onPointerMove(e){ // Capture  
                    pointer.spring.set({x:e.clientX+10, y:e.clientY+10});
                    pointer.position.set(e.clientX, e.clientY);
                    if(!pointer.dragging) return; 
                    if(vector.copy(pointer.position).sub(pointer.start).length() < 10) return;
                    commit_store(d=>{
                        if(d.drag.data.node) return 'cancel';
                        const data = d.drag.staged;
                        if(!e.ctrlKey || !data.root || !data.term || data.index == null) return 'cancel';
                        d.drop.edge(d, {...data, stem:data.node});
                    });
                    set_store(d=>{
                        if(d.drag.data.node) return;
                        const data = d.drag.staged;
                        if(e.ctrlKey){
                            d.drag.data = data;
                        }else{
                            d.drag.data = {node:data.node};
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
                c(Drag),
                c(Login),
		        c(Logout),
                c(Confirm),
                c(Row, {}, 
                    c(Col, {className:'col-auto ms-1 mt-1',
                        role: 'button',
                        onClick:e=> set_store(d=>{
                            d.mode = '/';
                            navigate(d.mode);
                        }),
                    }, 
                        c(Logo, {height:32}),
                    ),
                    c(Col, {},
                        buttons.map((button,i)=>
                            c(ToggleButton,{
                                id: 'mode'+i,
                                className: button.icon + ' border-0',
                                type: 'radio',
                                variant: 'outline-primary', //size: 'lg',
                                value: button.value,
                                checked: mode == button.value,
                                onChange:e=> set_store(d=>{
                                    d.mode = e.currentTarget.value;
                                    navigate(d.mode);
                                }),
                            }, 
                                window_width > 576 ? ' '+button.name : '',
                            )
                        ),
                        mode=='studio' && [c('span', {className:'ms-4 me-4 text-primary'}), c(Mode_Bar)],
                    ),
                    //mode=='studio' && c(Col, {}, c(Mode_Bar)),
                    c(Col, {className:'col-auto'},
                        c(ToggleButton,{
                            id: 'dark_mode_button',
                            type:'checkbox', variant:'outline-primary', 
                            checked: theme_mode=='dark',
                            className: 'border-0 bi-moon',
                            onChange:e=> set_store(d=> d.theme.toggle_mode(d)),
                        }),
                        c(Account_Menu),
                        // !data ? status && c(status) : 
                        //     data.user ? account_buttons.map((button,i)=> c(Account_Button, {button}))
                        //     : c(Account_Button, {button:{name:()=>'Sign In', icon:'bi-box-arrow-in-right', func:()=> show_login(true)}}),
                    ),
                ),
                c(Row, {className:'flex-grow-1'},  
                    c(Outlet),
                ),
            )//,
    	//)
  	)
} 

function Account_Menu(){
    const {data} = use_query('GetUser', [
        ['user id firstName'],
    ],{onCompleted:data=>{
        try{ set_store(d=> d.user_id = data.user.id); }
        catch(e){ console.log('Error fetching user info'); }
    }});
    if(!data) return 'Loading';
    if(!data.user?.firstName) return 'Error fetching user info';
    if(data.user) return [
        {name:()=>'Account ('+data.user.firstName+')',  icon:'bi-person', func(){}},
        {name:()=>'Sign Out', icon:'bi-box-arrow-left', func:()=> show_logout(true)}, 
        ].map(button=> c(Account_Button, {button}));
    return c(Account_Button, {
        button:{name:()=>'Sign In', 
        icon:'bi-box-arrow-in-right', 
        func:()=> show_login(true)}});
}


function Account_Button({button}){
    const [window_width] = use_window_size();
    return( 
        c(Button,{
            className: 'border-0 '+button.icon,
            variant: 'outline-primary', 
            onClick:e=> button.func(),
        }, 
            window_width > 576 ? ' '+button.name() : ''
        )
    )
}






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