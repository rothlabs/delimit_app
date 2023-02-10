import {createElement as r} from 'react';
import Container from 'boot/Container';
import Nav from 'boot/Nav';
import Navbar from 'boot/Navbar';
import NavDropdown from 'boot/NavDropdown';

const nav = JSON.parse(document.getElementById('nav').innerHTML);

export function Main_Navbar() {
  return (
    r(Navbar, {bg:"white", expand:"lg"},[
        r(Container,{},[
            r(Navbar.Brand, {href:nav.home}, 'delimit'),
            r(Navbar.Toggle, {ariaControls:"basic-navbar-nav"}),
            r(Navbar.Collapse, {id:"basic-navbar-nav"},[
                r(Nav, {className:"me-auto"},[
                    ...nav.main.map((item)=>r(Nav.Link, {href:item.url},item.name)),
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
                ])
            ])
        ])
    ])
  );
}

export default Main_Navbar;