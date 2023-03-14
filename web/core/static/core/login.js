import {createElement as r, useState, Fragment} from 'react';
import {Button, Modal, Form, Row} from 'boot';
import {makeVar, useReactiveVar} from 'apollo';
import {Logo} from './logo.js';
import {use_server} from './app.js';

export const show_login = makeVar(false);
const attempt_login = makeVar(false);

export function Login(){
	const show = useReactiveVar(show_login);
    const attempt = useReactiveVar(attempt_login);
    const [username, set_username] = useState('');
    const [password, set_password] = useState('');
    const close=()=> show_login(false);
	return (
		r(Modal,{show:show, onHide:close},
      		r(Modal.Header, {closeButton:true},  
                r(Modal.Title, {}, 'Sign In'),
      		),
            attempt ? r(Attempt, {username:username, password:password}) : 
                r(Fragment,{},
                    r(Modal.Body, {}, 
                        r(Row,{className:'mb-3'},
                            r(Logo, {className:'mx-auto', height:80}),
                        ),
                        r(Form.Group, {className:'mb-3'}, 
                            r(Form.Label, {}, 'Username'),
                            r(Form.Control, {type:'text', value:username, onChange:(e)=>set_username(e.target.value)}),
                        ),
                        r(Form.Group, {className:'mb-3'},
                            r(Form.Label, {}, 'Passwrod'),
                            r(Form.Control, {type:'password', value:password, onChange:(e)=>set_password(e.target.value)}),
                        ),
                    ),
                    r(Modal.Footer, {},
                        r(Button, {onClick:close, variant:'secondary'}, 'Cancel'),
                        r(Button, {onClick:()=>attempt_login(true)}, 'Submit'),
                    )
                ),
    	)
  	)
}

export function Attempt(p){
    const {data, alt} = use_server([
        ['login firstName', ['String! username', p.username], ['String! password', p.password]],
    ]); if(alt) return r(alt);
    if(data.login){
        show_login(false);
        setTimeout(() => attempt_login(false), 250);
    }else{
        attempt_login(false);
    }
    return null;
}


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