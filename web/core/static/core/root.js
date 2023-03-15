import {createElement as r, Fragment} from 'react';
import {Container, Nav, Navbar} from 'boot';
import {Outlet, Link} from 'rrd';
import {Login, show_login, Logout, show_logout} from './login.js';
import {Copy_Product, Delete_Product} from './studio/crud.js'
import {Logo} from './logo.js';
import {use_query} from './app.js';


export function Root(){
	const {data, alt} = use_query('GetUser', [
		['user firstName'],
	]); if(alt) return r(alt);
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
              				r(Nav.Link, {as:Link, to:'catalog', eventKey:1}, 'Catalog'),
              				r(Nav.Link, {as:Link, to:'studio', eventKey:2},  'Studio'),
            			),
						r(Nav, {className:"me-2"},
							data.user ? r(Fragment,{},
								r(Nav.Link, {eventKey:3}, 'Account ('+data.user.firstName+')'),
								r(Nav.Link, {onClick:()=>show_logout(true), eventKey:4}, 'Sign Out'),
							): 
								r(Nav.Link, {onClick:()=>show_login(true), eventKey:4},  'Sign In'),
            			),
          			),
        		)
      		),
			r(Login),
			r(Logout),
			r(Copy_Product),
			r(Delete_Product),
      		r(Outlet),
    	)
  	)
} 


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