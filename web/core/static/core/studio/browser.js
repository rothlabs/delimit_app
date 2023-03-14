import {createElement as r, useEffect} from 'react';
import {Container, Card, Button, Row, Col} from 'boot';
import {Link} from 'rrd';
import {use_query} from '../app.js';

export function Studio_Browser(){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    const {data, alt} = use_query('GetProducts', [
		['products id name'],
	]); if(alt) return r(alt);
    return (
        r(Container,{fluid:true, className:'pt-4 pb-2'},
            r(Row, {className:'gap-3'}, !data.products ? 'No products found.' : [
                ...data.products.map((product,i)=>(
                    r(Col,{key:i},
                        r(Card, {style:{width:'18rem'}, className:'mx-auto'},
                            r(Card.Img, {variant:'top', src:'holder.js/100px180', className:'hjs'}),
                            r(Card.Body,{},
                                r(Card.Title,{},product.name),
                                r(Card.Text,{},'Some quick example text to build on the card title and make up the bulk of the content.'),
                                r(Button, {as:Link, to:product.id}, 'Edit'),
                            )
                        )
                    )
                )),
            ])
        )
    )
}