import {createElement as c, useState, Fragment} from 'react';
import {Button, Modal, Form, Row, InputGroup} from 'react-bootstrap';
import {use_store, set_store} from 'delimit';

export function Confirm(){
    const title = use_store(d=> d.confirm.title);
    const body  = use_store(d=> d.confirm.body);
    const func  = use_store(d=> d.confirm.func);
	return (
		c(Modal, {
            show: title,
            onHide:e=> set_store(d=> d.confirm = {}),
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
                        set_store(d=> d.confirm = {});
                        func();
                    }, 
                    variant:'danger'
                },  'Delete'),
                c(Button, {
                    onClick:e=>{
                        set_store(d=> d.confirm = {});
                    }, 
                    variant:'secondary'
                },  'Cancel'),
            ),
    	)
  	)
}
