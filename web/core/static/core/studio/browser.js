import {createElement as r, useEffect} from 'react';
import {Container, ButtonGroup, Card, Button, Row, Col} from 'boot';
import {Link} from 'rrd';
import {use_query} from '../app.js';
import {show_copy_product, show_delete_product} from './crud.js';

export function Studio_Browser(){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    const {data, alt} = use_query('GetProducts', [
		['products id name public description'],
	]); if(alt) return r(alt);
    return (
        r(Container,{fluid:true, className:'pt-4 pb-2'},
            r(Row, {className:'gap-3'}, !data.products ? 'No products found.' : [
                ...data.products.map((product,i)=>(
                    r(Col,{key:i},
                        r(Card, {style:{width:'20rem'}, className:'mx-auto'},
                            r(Card.Img, {variant:'top', src:'holder.js/100px180', className:'hjs'}),
                            r(Card.Body,{},
                                r(Card.Title,{},product.name),
                                r(Card.Text,{}, product.description),
                                product.public ? r(Card.Text,{},r('i',{className:'bi-globe-europe-africa'}),r('span',{},' Public')) :
                                    r(Card.Text,{},r('i',{className:'bi-file-lock2-fill'}),r('span',{},' Private')),
                                r(Button, {as:Link, to:product.id, className:'w-50 me-3'}, 'Edit'),
                                //r(ButtonGroup, {role:'group', arialabel:'Actions', className: 'position-absolute'},
                                    r(Button, {onClick:()=>show_copy_product(product), variant:'secondary', className:'me-3'}, 'Copy'),
                                    r(Button, {onClick:()=>show_delete_product(product), variant:'secondary'}, 'D'),
                                //)
                            )
                        )
                    )
                )),
            ])
        )
    )
}