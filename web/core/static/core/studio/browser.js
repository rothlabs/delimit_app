import {createElement as r, useEffect} from 'react';
import {Container, Card, Button, Row, Col} from 'boot';
import {Link} from 'rrd';
import {use_query} from '../app.js';
import {show_copy_project, show_delete_project} from './crud.js';

export function Studio_Browser(){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    // also request list of names where names[part] = 'Cool Part'
    const [data, status] = use_query('GetPack', [
		['pack roots{model id} p{id r props{name model ids}} t{id v r} b{id v r} i{id v r} f{id v r} s{id v r}'], ['user id'], //['parts id name story public owner{id firstName}'], ['user id'],
	],{onCompleted:(data)=>{
        console.log(data.pack);
        const pack = {roots:[], p:{}};
        data.pack.p.forEach(e=> pack.p[e.id] = {r:e.r, props:e.props});
        ['t','b','i','f','s'].forEach(model=>{
            pack[model] = {};
            data.pack[model].forEach(e=> pack[model][e.id] = {v:e.v, r:e.r});
        });
        pack.p.forEach(part=>{
            part.props.forEach(prop=>{
                part[prop.name] = [];
                prop.ids.forEach((id)=> part[prop.name].push(pack[prop.model][id]));
            });
        });
        data.pack.roots.forEach(root=>{
            pack.roots.push(pack[root.model][root.id]);
        });
        console.log(pack);
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


// function build_part(part){
        //     part.props.forEach((prop)=>{
        //         values = [];
        //         prop.ids.forEach((id)=> values.push(pack[prop.model][id])); //data.pack[prop.model].find(e=> e.id==prop.id);
        //         if(prop.model == 'p') {
        //             part[prop.name] = values.map(e=> build_part(e));
        //         }else{
        //             part[prop.name] = values;
        //         }
        //     });
        //     return part;
        // }
        // data.pack.roots.forEach(data_root => {
        //     value = pack[data_root.model][data_root.id] //data.pack[data_root.model].find(e=> e.id==data_root.id);
        //     if(data_root.model == 'p') {
        //         pack.roots.push(build_part(value));
        //     }else{
        //         pack.roots.push(value);
        //     }
        // });