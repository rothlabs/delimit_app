import {createElement as r, useEffect} from 'react';
import {Container, Card, Button, Row, Col} from 'boot';
import {Link} from 'rrd';
import {use_query} from '../app.js';
import {show_copy_project, show_delete_project} from './crud.js';

export function Studio_Browser(){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    // also request list of names where names[part] = 'Cool Part'
    const [data, status] = use_query('GetPack', [
		['pack p{id} t{id v} b{id v} i{id v} f{id v} s{id v}'], ['user id'], //['parts id name story public owner{id firstName}'], ['user id'],
	],{onCompleted:(data)=>{
        console.log(data);
    }}); 
    // props{partId valueId name model}
    return (
        r(Container,{fluid:true, className:'ps-4 pe-4 pt-4 pb-4'},
            r(Row, {className:'gap-3'}, //row-cols-auto  
                !data ? status && r(status) :
                    data.pack.p.length<1 ? 'No parts found.' : 
                        'found products'
                        // [...data.parts.map((part,i)=>(
                        //     r(Col,{key:i},
                        //         r(Card, {style:{width:'20rem'}, className:'mx-auto'},
                        //             r(Card.Img, {variant:'top', src:'holder.js/100px180', className:'hjs'}),
                        //             r(Card.Body,{},
                        //                 r(Card.Title,{},part.name),
                        //                 r(Card.Text,{}, part.story),
                        //                 r(Row, {className:'mb-3'},
                        //                     r(Col, {},
                        //                         part.public ? r(Card.Text,{},r('i',{className:'bi-globe-europe-africa'}),r('span',{},' Public')) :
                        //                             r(Card.Text,{},r('i',{className:'bi-lock-fill'}),r('span',{},' Private')),
                        //                     ),
                        //                     r(Col, {},
                        //                         r(Card.Text,{},r('i',{className:'bi-person-fill'}),r('span',{},' '+part.owner.firstName))
                        //                     ),
                        //                 ),
                        //                 r(Button, {as:Link, to:part.id, className:'w-50 me-3'}, 'Edit'),
                        //                 data.user && r(Button, {onClick:()=>show_copy_project([part, false]), variant:'secondary', className:'me-3'}, 'Copy'),
                        //                 data.user && (part.owner.id == data.user.id) && r(Button, {onClick:()=>show_delete_project(part), variant:'secondary'}, 'D'),
                        //             )
                        //         )
                        //     )
                        // ))]
            )
        )
    )
}