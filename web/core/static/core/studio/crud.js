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
        if(product){
            set_name(product.name);
            reset(); 
        }else{
            setTimeout(()=> reset(), 250);
        }
    },[product]);
    if(data && data.copyProduct.product) setTimeout(()=> show_copy_product(null), 1500);
    const key_press=(target)=> {if(target.charCode==13) copy_product()}; 
	return (
		r(Modal,{show:product, onHide:()=>show_copy_product(false), autoFocus:false},
      		r(Modal.Header, {closeButton:true},  
                product && r(Modal.Title, {}, 'Copy '+ product.name),
      		),
            alt ? r(Modal.Body, {}, r(alt)) :
                data && data.copyProduct.product ? r(Modal.Body, {}, r('p', {}, 'Copied '+product.name)) :
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