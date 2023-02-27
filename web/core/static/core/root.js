import {createElement as r, Fragment} from 'react';
import {Container, Nav, Navbar} from 'boot';
import {Outlet, Link} from 'rrd';
//import {Row, Col, Button} from 'core/ui.js';
import {app} from './app.js';
//import {useStore} from 'easel/init.js'
//import {Nav} from 'boot';
//import {Navbar} from 'boot';
//import NavDropdown from 'boot/NavDropdown'; 

//const nav = JSON.parse(document.getElementById('nav').innerHTML); 

export function Root(){
  //const set_page = useStore((state) => state.set_page); 
  return (
    r(Fragment,{},
      r(Navbar, {bg:'white', expand:'lg',collapseOnSelect:true},  
        r(Container,{},
          r(Navbar.Brand, {style:{cursor:'pointer'}, as:Link, to:'/'}, //onClick:()=>page_var('/')
            r('img',{src:app.logo, style:{height:40}})
          ), //{href:nav.home}, 'delimit'
          r(Navbar.Toggle, {ariacontrols:"basic-navbar-nav"}),
          r(Navbar.Collapse, {id:"basic-navbar-nav"},
            r(Nav, {className:"me-auto"},
              r(Nav.Link, {as:Link, eventKey:0, to:'catalog'}, 'Catalog'),//{onClick:()=>page_var('catalog'), eventKey:'0'},'Catalog'),
              r(Nav.Link, {as:Link, eventKey:1, to:'studio'},  'Studio'),//{onClick:()=>page_var('studio'), eventKey:'1'},'Studio'),
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
            )
          )
        )
      ),
      r(Outlet),
    )
  );
} 