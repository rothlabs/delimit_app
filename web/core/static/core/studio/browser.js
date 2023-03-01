import {createElement as r, useEffect} from 'react';
import {useQuery, gql} from 'apollo';
import {Container, Card, Button, Row, Col} from 'boot';
import {Link} from 'rrd';
import {Loading, Error_Page} from '../feedback.js';

export function Design_Browser(){
    const {loading, error, data} = useQuery(gql`query{ 
        products {
            id
            name
        }
    }`);
    useEffect(()=>{Holder.run({images:'.hjs'});});
    if (loading) return r(Loading);
    if (error)   return r(Error_Page);
    return (
        r(Container,{fluid:true, className:'pt-4 pb-2'},
            r(Row,{className:'gap-3'},[
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