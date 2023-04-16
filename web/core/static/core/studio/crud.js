import {createElement as r, useState, Fragment, useEffect} from 'react';
import {Button, Modal, Form, InputGroup} from 'boot';
import {makeVar, useReactiveVar} from 'apollo';
import {use_mutation} from '../app.js';

export const show_copy_product = makeVar();
export function Copy_Product(){
	const product = useReactiveVar(show_copy_product);
    const [name, set_name] = useState('');
    const [save_product, data, alt, reset] = use_mutation([
        ['saveProduct response product{name}', 
            ['Boolean! toNew', true], 
            ['String! id', product && product.id], 
            ['String! name', name],
            ['Boolean! public', false],]
    ], 'GetProducts');
    useEffect(()=>{
        if(product) set_name(product.name);
        if(!product) setTimeout(()=> reset(), 250);
    },[product]);
    if(data && data.saveProduct.product) setTimeout(()=> show_copy_product(false), 1500); //&& data.saveProduct
    const key_press=(target)=> {if(target.charCode==13) save_product()}; 
	return (
		r(Modal,{show:product, onHide:()=>show_copy_product(false), autoFocus:false},
      		r(Modal.Header, {closeButton:true},  
                product && r(Modal.Title, {}, 'Copy '+ product.name),
      		),
            alt ? r(Modal.Body, {}, r(alt)) :
                data && data.saveProduct.product ? r(Modal.Body, {}, r('p', {}, data.saveProduct.response)) :
                    r(Fragment,{},
                        r(Modal.Body, {}, 
                            data && r('p', {}, data.saveProduct.response),
                            r(InputGroup, {className:'mb-3'}, 
                                r(InputGroup.Text, {}, 'Name'),
                                r(Form.Control, {type:'text', maxLength:64, value:name, onChange:(e)=>set_name(e.target.value), onKeyPress:key_press, autoFocus:true}),
                            ),
                        ),
                        r(Modal.Footer, {},
                            r(Button, {onClick:()=>show_copy_product(false), variant:'secondary'}, 'Cancel'),
                            r(Button, {onClick:save_product}, 'Copy'),
                        )
                    ),
    	)
  	)
}

export const show_delete_product = makeVar();
export function Delete_Product(){
	const product = useReactiveVar(show_delete_product);
    const [delete_product, data, alt, reset] = use_mutation([
        ['deleteProduct response product{name}', ['String! id', product && product.id]],
    ], 'GetProducts');
    useEffect(()=>{
        if(!product) setTimeout(()=> reset(), 250);
    },[product]);
    if(data && data.deleteProduct.product) setTimeout(()=> show_delete_product(false), 1500);
	return (
		r(Modal,{show:product, onHide:()=>show_delete_product(false), autoFocus:false},
      		r(Modal.Header, {closeButton:true},  
                product && r(Modal.Title, {}, 'Delete '+ product.name),
      		),
            alt ? r(Modal.Body, {}, r(alt)) :
                data && data.deleteProduct.product ? r(Modal.Body, {}, r('p', {}, data.deleteProduct.response)) :
                    r(Fragment,{},
                        r(Modal.Body, {}, 
                            data && r('p', {}, data.deleteProduct.response),
                            product && r('p', {}, 'Are you sure you want to delete ' + product.name + '?')
                        ),
                        r(Modal.Footer, {},
                            r(Button, {onClick:()=>show_delete_product(false), variant:'secondary'}, 'Cancel'),
                            r(Button, {onClick:delete_product}, 'Delete'),
                        )
                    ),
    	)
  	)
}