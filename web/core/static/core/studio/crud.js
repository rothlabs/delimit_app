import {createElement as r, useState, Fragment, useEffect} from 'react';
import {Button, Modal, Form} from 'boot';
import {makeVar, useReactiveVar} from 'apollo';
import {use_mutation} from '../app.js';

export const show_copy_product = makeVar();
export function Copy_Product(){
	const product = useReactiveVar(show_copy_product);
    const [name, set_name] = useState('');
    const [copy_product, { data, alt, reset }] = use_mutation([
        ['copyProduct product{name}', ['String! id', product && product.id], ['String! name', name]],
    ], 'GetProducts');
    useEffect(()=>{
        if(product) set_name(product.name);
        if(!product) setTimeout(()=> reset(), 250);
    },[product]);
    if(data && data.copyProduct.product) setTimeout(()=> show_copy_product(false), 1500);
    const key_press=(target)=> {if(target.charCode==13) copy_product()}; 
	return (
		r(Modal,{show:product, onHide:()=>show_copy_product(false), autoFocus:false},
      		r(Modal.Header, {closeButton:true},  
                product && r(Modal.Title, {}, 'Copy '+ product.name),
      		),
            alt ? r(Modal.Body, {}, r(alt)) :
                data && data.copyProduct.product ? r(Modal.Body, {}, r('p', {}, 'Copied as '+data.copyProduct.product.name)) :
                    r(Fragment,{},
                        r(Modal.Body, {}, 
                            data && r('p', {}, 'Copy failed.'),
                            r(Form.Group, {className:'mb-3'}, 
                                r(Form.Label, {}, 'Name'),
                                r(Form.Control, {type:'text', value:name, onChange:(e)=>set_name(e.target.value), onKeyPress:key_press, autoFocus:true}),
                            ),
                        ),
                        r(Modal.Footer, {},
                            r(Button, {onClick:copy_product}, 'Copy'),
                        )
                    ),
    	)
  	)
}

export const show_delete_product = makeVar();
export function Delete_Product(){
	const product = useReactiveVar(show_delete_product);
    const [delete_product, { data, alt, reset }] = use_mutation([
        ['deleteProduct product{name}', ['String! id', product && product.id]],
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
                data && data.deleteProduct.product ? r(Modal.Body, {}, r('p', {}, 'Deleted '+data.deleteProduct.product.name)) :
                    r(Fragment,{},
                        r(Modal.Body, {}, 
                            data && r('p', {}, 'Delete failed.'),
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