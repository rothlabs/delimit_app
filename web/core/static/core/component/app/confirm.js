import {createElement as c, useState} from 'react';
import {Button, Modal} from 'react-bootstrap';
import {use_store, set_store, render_token} from 'delimit';

export function Confirm(){
    const title = use_store(d=> d.confirm.title);
    const body  = use_store(d=> d.confirm.body);
    const func  = use_store(d=> d.confirm.func);
    const input_name  = use_store(d=> d.confirm.input_name);
    const [input, set_input] = useState('');
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
                input_name && render_token({
                    name: input_name,
                    height: 128,
                    content: ({render_name, render_input}) => [
                        render_name({minWidth:120}),
                        render_input({
                            value: input, 
                            //placeholder: 'What did you change?', 
                            onChange: e => set_input(e.target.value),
                        }),
                    ],
                }),
            ),
            c(Modal.Footer, {},
                c(Button, {
                    onClick:e=>{
                        set_store(d=> d.confirm = {});
                        func(input);
                    }, 
                    variant:'danger'
                },  'Confirm'),
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
