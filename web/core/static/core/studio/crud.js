import {createElement as r, useState, Fragment, useEffect} from 'react';
import {Button, Modal, Form, InputGroup} from 'boot';
import {makeVar, useReactiveVar} from 'apollo';
import {use_mutation} from '../app.js';
import {useNavigate} from 'rrd';

export const show_copy_product = makeVar([null,false]);
export function Copy_Product(){
    const navigate = useNavigate();
	const [product, nav] = useReactiveVar(show_copy_product);
    const [name, set_name] = useState('');
    const [save_product, data, status, reset] = use_mutation([
        ['editProduct reply product{id name}', 
            ['Boolean! toNew', true], 
            ['String! id', product && product.id], 
            ['String! name', name],
            ['Boolean! public', false],]
    ], 'GetProducts');
    useEffect(()=>{
        if(product) set_name(product.name);
        if(!product) setTimeout(()=> reset(), 250);
    },[product]);
    useEffect(()=>{
        if(data && data.editProduct.product){ 
            setTimeout(()=> show_copy_product([null,false]), 1500)
            nav && navigate('/studio/'+data.editProduct.product.id);
        }; //&& data.editProduct
    },[data]);
    const key_press=(target)=> {if(target.charCode==13) save_product()}; 
	return (
		r(Modal,{show:product, onHide:()=>show_copy_product(false), autoFocus:false},
      		r(Modal.Header, {closeButton:true},  
                product && r(Modal.Title, {}, 'Copy '+ product.name),
      		),
            //alt ? r(Modal.Body, {}, r(alt)) :
                //data && data.editProduct.product ? r(Modal.Body, {}, r('p', {}, data.editProduct.response)) :
                    //r(Fragment,{},
                        r(Modal.Body, {}, 
                            //data && r('p', {}, data.editProduct.response),
                            status ? r(status) :
                                r(InputGroup, {className:'mb-3'}, 
                                    r(InputGroup.Text, {}, 'Name'),
                                    r(Form.Control, {type:'text', maxLength:64, value:name, onChange:(e)=>set_name(e.target.value), onKeyPress:key_press, autoFocus:true}),
                                ),
                        ),
                        r(Modal.Footer, {},
                            r(Button, {onClick:()=>show_copy_product(false), variant:'secondary'}, 'Cancel'),
                            r(Button, {onClick:save_product}, 'Copy'),
                        )
                    //),
    	)
  	)
}

export const show_delete_product = makeVar();
export function Delete_Product(){
	const product = useReactiveVar(show_delete_product);
    const [delete_product, data, status, reset] = use_mutation([
        ['deleteProduct reply product{name}', ['String! id', product && product.id]],
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
            //alt ? r(Modal.Body, {}, r(alt)) :
                //data && data.deleteProduct.product ? r(Modal.Body, {}, r('p', {}, data.deleteProduct.response)) :
                    //r(Fragment,{},
                        r(Modal.Body, {}, 
                            //data && r('p', {}, data.deleteProduct.response),
                            status ? r(status) : product && r('p', {}, 'Are you sure you want to delete ' + product.name + '?')
                        ),
                        r(Modal.Footer, {},
                            r(Button, {onClick:()=>show_delete_product(false), variant:'secondary'}, 'Cancel'),
                            r(Button, {onClick:delete_product}, 'Delete'),
                        )
                    //),
    	)
  	)
}