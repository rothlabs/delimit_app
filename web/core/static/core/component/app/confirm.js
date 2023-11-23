import {createElement as c, useState, Fragment} from 'react';
import {Button, Modal, Form, Row, InputGroup} from 'react-bootstrap';
import {gs, ss, rs, useS} from '../../app.js';

export function Confirm(){
    const title = useS(d=> d.confirm.title);
    const body  = useS(d=> d.confirm.body);
    const func  = useS(d=> d.confirm.func);
	return (
		c(Modal, {
            show: title,
            onHide:e=> rs(d=> d.confirm = {}),
            //autoFocus:false
        }, 
      		c(Modal.Header, {closeButton:true},  
                c(Modal.Title, {}, title),
      		),
            c(Modal.Body, {}, 
                body,
            ),
            c(Modal.Footer, {},
                c(Button, {
                    onClick:e=>{
                        rs(d=> d.confirm = {});
                        func();
                    }, 
                    variant:'danger'
                },  'Delete'),
                c(Button, {
                    onClick:e=>{
                        rs(d=> d.confirm = {});
                    }, 
                    variant:'secondary'
                },  'Cancel'),
            ),
    	)
  	)
}
