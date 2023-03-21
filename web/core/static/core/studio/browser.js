import {createElement as r, useEffect} from 'react';
import {Container, ButtonGroup, Card, Button, Row, Col} from 'boot';
import {Link} from 'rrd';
import {use_query} from '../app.js';
import {show_copy_product, show_delete_product} from './crud.js';

export function Studio_Browser(){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    const [data, alt] = use_query('GetProducts', [
		['products id name story public owner{id firstName}'], ['user id'],
	],'no-cache'); 
    return (
        r(Container,{fluid:true, className:'ps-4 pe-4 pt-4 pb-4'},
            r(Row, {className:'gap-3'}, //row-cols-auto  
                alt ? r(alt) :
                    data.products.length<1 ? 'No products found.' : 
                        [...data.products.map((product,i)=>(
                            r(Col,{key:i},
                                r(Card, {style:{width:'20rem'}, className:'mx-auto'},
                                    r(Card.Img, {variant:'top', src:'holder.js/100px180', className:'hjs'}),
                                    r(Card.Body,{},
                                        r(Card.Title,{},product.name),
                                        r(Card.Text,{}, product.story),
                                        r(Row, {className:'mb-3'},
                                            r(Col, {},
                                                product.public ? r(Card.Text,{},r('i',{className:'bi-globe-europe-africa'}),r('span',{},' Public')) :
                                                    r(Card.Text,{},r('i',{className:'bi-lock-fill'}),r('span',{},' Private')),
                                            ),
                                            r(Col, {},
                                                r(Card.Text,{},r('i',{className:'bi-person-fill'}),r('span',{},' '+product.owner.firstName))
                                            ),
                                        ),
                                        r(Button, {as:Link, to:product.id, className:'w-50 me-3'}, 'Edit'),
                                        data.user && r(Button, {onClick:()=>show_copy_product(product), variant:'secondary', className:'me-3'}, 'Copy'),
                                        data.user && (product.owner.id == data.user.id) && r(Button, {onClick:()=>show_delete_product(product), variant:'secondary'}, 'D'),
                                    )
                                )
                            )
                        ))]
            )
        )
    )
}