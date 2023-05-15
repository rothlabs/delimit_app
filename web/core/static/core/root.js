import {createElement as c, Fragment, useEffect} from 'react';
import {Container, Nav, Navbar, ToggleButton, ButtonGroup} from 'react-bootstrap';//'boot';
import {Outlet, Link} from 'react-router-dom';
import {Login, show_login, Logout, show_logout} from './login.js';
//import {Copy_Project, Delete_Project} from './studio/crud.js'
import {Logo} from './logo.js';
import {ss, use_query} from './app.js';


export function Root(){
	const {data, status} = use_query('GetUser', [
		['user id firstName'],
	],{onCompleted:(data)=>{
		if(data.user){
			//console.log('User ID: '+data.user.id);
			ss(d=> d.user = data.user.id );
		} 
	}}); 
	return (
		c(Fragment,{},
      		c(Navbar, {bg:'white', expand:'lg', collapseOnSelect:true},  
        		c(Container,{fluid:true, className:'ps-4 pe-4'},
          			c(Navbar.Brand, {style:{cursor:'pointer'}, as:Link, to:'/'}, 
            			c(Logo, {height:40}),
          			),
					c(Navbar.Toggle, {ariacontrols:"basic-navbar-nav"}),
          			c(Navbar.Collapse, {id:"basic-navbar-nav"},
            			c(Nav, {className:"me-auto"},
              				c(Nav.Link, {as:Link, to:'catalog', eventKey:1, className:'ms-auto'}, 'Catalog'),
              				c(Nav.Link, {as:Link, to:'studio', eventKey:2, className:'ms-auto'},  'Studio'),
            			),
						c(Nav, {className:"me-2"},
							!data ? status && c(status) :
								data.user ? c(Fragment,{},
									c(Nav.Link, {id:'root_account', eventKey:3, className:'ms-auto'}, 'Account ('+data.user.firstName+')'),
									c(Nav.Link, {id:'root_logout', onClick:()=>show_logout(true), eventKey:4, className:'ms-auto bi-box-arrow-left'}, ' Sign Out'), //, c('i',{className:'bi-box-arrow-left'})
								): 
									c(Nav.Link, {id:'root_login', onClick:()=>show_login(true), eventKey:5, className:'ms-auto bi-box-arrow-in-right'}, ' Sign In'), //c('i',{className:'bi-box-arrow-in-right'})
            			),
          			),
        		)
      		),
			c(Login),
			c(Logout),
			//c(Copy_Project),
			//c(Delete_Project),
      		c(Outlet),
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