import {createElement as r, useState, Fragment, useEffect} from 'react';
import {Button, Modal, Form, Row} from 'boot';
import {makeVar, useReactiveVar} from 'apollo';
import {Logo} from './logo.js';
import {use_query, use_mutation} from './app.js';

export const show_login = makeVar(false);

export function Login(){
	const show = useReactiveVar(show_login);
    const [username, set_username] = useState('');
    const [password, set_password] = useState('');
    useEffect(()=>{set_username('');set_password('')},[show]);
    const [login, { data, alt, reset }] = use_mutation([
        ['login user {firstName}', ['String! username', username], ['String! password', password]],
    ], 'GetUser GetProducts');
    if(data && data.login.user) show_login(false);
    const key_press=(target)=> {if(target.charCode==13) login()}; //attempt_login(true);};
	return (
		r(Modal,{show:show, onHide:()=>show_login(false), autoFocus:false},
      		r(Modal.Header, {closeButton:true},  
                r(Modal.Title, {}, 'Sign In'),
      		),
            alt ? r(Modal.Body, {}, r(alt)) :
                data && data.login.user ? r(Modal.Body, {}, r('p', {}, 'Welcome '+data.login.user.firstName)) :
                    r(Fragment,{},
                        r(Modal.Body, {}, 
                            r(Row,{className:'mb-3'},
                                r(Logo, {className:'mx-auto', height:80}),
                            ),
                            data && r('p', {}, 'Sign in failed.'),
                            r(Form.Group, {className:'mb-3'}, 
                                r(Form.Label, {}, 'Username'),
                                r(Form.Control, {type:'text', value:username, onChange:(e)=>set_username(e.target.value), onKeyPress:key_press, autoFocus:true}),
                            ),
                            r(Form.Group, {className:'mb-3'},
                                r(Form.Label, {}, 'Passwrod'),
                                r(Form.Control, {type:'password', value:password, onChange:(e)=>set_password(e.target.value), onKeyPress:key_press}),
                            ),
                        ),
                        r(Modal.Footer, {},
                            r(Button, {onClick:login}, 'Sign In'),
                        )
                    ),
    	)
  	)
}

export const show_logout = makeVar(false);

export function Logout(){
    const show = useReactiveVar(show_logout);
    const [logout, { data, alt, reset }] = use_mutation([
        ['logout user {firstName}'],
    ], 'GetUser GetProducts');
    if(data && data.logout) setTimeout(()=> show_logout(false), 2000);
    useEffect(()=> {if(show) logout()}, [show]);
    return (
        r(Modal,{show:show, onHide:()=>show_logout(false)},
      		r(Modal.Header, {closeButton:true},  
                r(Modal.Title, {}, 'Sign Out'),
      		),
            r(Modal.Body, {}, 
                 alt? r(alt): 
                    data && data.logout.user? r('p', {}, 'Farewell '+data.logout.user.firstName): 
                        r('p', {}, 'Sign out failed.')
             )
    	)
    )
}

// function Attempt_Logout(){
//     const {data, alt} = use_query('GetLogout',[
//         ['logout firstName'],
//     ]); if(alt) return r(alt);
//     if(data.logout){
//         setTimeout(()=> show_logout(false), 2000);
//         return r('p', {}, 'Farewell '+data.logout.firstName);
//     }else{
//         return r('p', {}, 'Sign out failed.');
//     }
// }



//r(Button, {onClick:()=>attempt_login(true)}, 'Sign In'),
//const attempt_login = makeVar(false);
//const attempt = useReactiveVar(attempt_login);

//attempt ? r(Attempt_Login, {username:username, password:password}) : 

// function Attempt_Login(p){
//     const {data, alt} = use_query([
//         ['login firstName', ['String! username', p.username], ['String! password', p.password]],
//     ]); if(alt) return r(alt);
//     if(data.login){
//         show_login(false);
//         setTimeout(() => attempt_login(false), 250);
//         return r('p', {}, 'Welcome '+data.login.firstName);
//     }else{
//         attempt_login(false);
//         return null;
//     }
// }

// const {loading, error, data} = useQuery(gql`query Login($username: String!, $password: String!){  
    //     login(username: $username, password: $password) {
    //         firstName
    //     }
    // }`,{variables:{username:p.username, password:p.password}, fetchPolicy:'no-cache'}); 
    // if (loading) return r(Loading);
    // if (error)   return r(Error_Page);

// function submit(){
    //     client.query({query:gql`query{ 
    //         products {
    //             id
    //             name
    //         }
    //     }`}).then((result) => console.log(result));
    // }

//setTimeout(() => attempt_login(false), 3000);

//return (
    //    r('p',{}, data.login ? 'Welcome '+data.login.email : 'Sign in failed. Please try again.') 
    //)

    //, controlId:'username'