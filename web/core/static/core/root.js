import {createElement as r, Fragment} from 'react';
import {Container, Nav, Navbar} from 'boot';
import {Outlet, Link} from 'rrd';
//import {Row, Col, Button} from 'core/ui.js';
import {Logo} from './logo.js';
//import {useStore} from 'easel/init.js'
//import {Nav} from 'boot';
//import {Navbar} from 'boot';
//import NavDropdown from 'boot/NavDropdown'; 

//const nav = JSON.parse(document.getElementById('nav').innerHTML); 

//console.log(dd.theme);

export function Root(){
  //const set_page = useStore((state) => state.set_page); 
	return (
		r(Fragment,{},
      		r(Navbar, {bg:'white', expand:'lg', collapseOnSelect:true},  
        		r(Container,{fluid:true, className:'ps-4 pe-4'},
          			r(Navbar.Brand, {style:{cursor:'pointer'}, as:Link, to:'/'}, 
            			r(Logo, {height:40}),
          			),
					r(Navbar.Toggle, {ariacontrols:"basic-navbar-nav"}),
          			r(Navbar.Collapse, {id:"basic-navbar-nav"},
            			r(Nav, {className:"me-auto"},
              				r(Nav.Link, {as:Link, eventKey:1, to:'catalog'}, 'Catalog'),
              				r(Nav.Link, {as:Link, eventKey:2, to:'studio'},  'Studio'),
            			)
          			),
        		)
      		),
      		r(Outlet),
    	)
  	)
} 

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