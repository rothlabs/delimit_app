import {createElement as r, useState, useEffect} from 'react';
import {Button, Modal, Form, Row, InputGroup} from 'react-bootstrap';
import {makeVar, useReactiveVar} from '../../apollo/ApolloClient.js';//'@apollo/client';
import {Logo} from './logo.js';
//import {gs, ss, rs, useS, use_mutation, gql_client} from '../../app.js';
//import {useNavigate} from 'react-router-dom';
import {use_mutation, gql_client} from 'delimit';

export const show_login = makeVar(false);

export function Login(){
	const show = useReactiveVar(show_login);
    const [username, set_username] = useState('');
    const [password, set_password] = useState('');
    const [login, {loading, error, data, reset}] = use_mutation('Login', {
        refetchQueries:['GetUser', 'GetRepos'], 
        onCompleted(data){
            if(data.login.user) setTimeout(()=> show_login(false), 1500);
        },
    });
    useEffect(()=>{
        set_username('');
        set_password('');
        if(show) reset(); else setTimeout(()=> reset(), 250);
    },[show]);
    //if(data && data.login.user) setTimeout(()=> show_login(false), 1500);
    const key_press=(target)=> {if(target.charCode==13) login({variables:{username, password}})}; //attempt_login(true);};
	return (
		r(Modal,{show, onHide:()=>show_login(false), autoFocus:false},
      		r(Modal.Header, {closeButton:true},  
                r(Modal.Title, {}, 'Sign In'),
      		),
            //alt ? r(Modal.Body, {}, r(alt)) :
            
                //!data && //data.login.user &&
            //r(Fragment,{},
                r(Modal.Body, {}, 
                    r(Row,{className:'mb-3'},
                        r(Logo, {className:'mx-auto', height:70}),
                    ),
                    //data && r('p', {}, data.login.response),
                    ///////////////status && r(status),
                    r(InputGroup, {className:'mb-3'}, 
                        r(InputGroup.Text, {}, 'Username'),
                        r(Form.Control, {id:'username_field', type:'text', value:username, onChange:(e)=>set_username(e.target.value), onKeyPress:key_press, autoFocus:true}),
                    ),
                    r(InputGroup, {className:'mb-3'},
                        r(InputGroup.Text, {}, 'Password'),
                        r(Form.Control, {id:'password_field', type:'password', value:password, onChange:(e)=>set_password(e.target.value), onKeyPress:key_press}),
                    ),
                ),
                r(Modal.Footer, {},
                    r(Button, {
                        id:'modal_login',
                        onClick(e){
                            console.log({variables:{username, password}});
                            login({variables:{username, password}});
                        },
                    }, 'Sign In'),
                ),
            //),
    	)
  	)
}

export const show_logout = makeVar(false);

export function Logout(){
    const show = useReactiveVar(show_logout);
    //const navigate = useNavigate();
    const [logout, {loading, data, reset}] = use_mutation('Logout',{
        refetchQueries:['GetUser'], 
        onCompleted(data){
            gql_client.resetStore();
            setTimeout(()=> show_logout(false), 1500);
        }
    });
    //if(data) setTimeout(()=> show_logout(false), 1500);
    useEffect(()=> {if(show){
        logout(); 
        //navigate('/');
    }},[show]);
    return (
        r(Modal,{show, onHide:()=>show_logout(false)},
      		r(Modal.Header, {closeButton:true},  
                r(Modal.Title, {}, 'Sign Out'),
      		),
            r(Modal.Body, {}, 
                'Signed out',//status && r(status) 
            )
    	)
    )
}


// Object.entries(d.n).forEach(([n,node],i)=> {
                //     if(node.asset) nodes.push(n);
                // });
                // d.close(d, nodes);

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
    //         projects {
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