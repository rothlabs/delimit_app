import {createElement as r, useEffect, useState} from 'react';
import {Container, Card, Button, Row, Col} from 'boot';
import {Link} from 'rrd';
import {use_query} from '../app.js';
import {show_copy_project, show_delete_project} from './crud.js';

const throughs = ['p','b','i','f','s'].map(m=> 'p'+m+'1{t1{v} t2{v} m2{id}}').join(' ');

export function Graph(){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    // also request list of names where names[part] = 'Cool Part'  
    const [pack, set_pack] = useState({root:null});
    const [data, status] = use_query('GetPack', [  // pack is a part that holds all models instances to specified depth and the first sub part holds all roots  
		['pack p{id t{v} '+throughs+'} b{id v} i{id v} f{id v} s{id v}',
            ['Int depth', null], ['ID id', null], ['[[String]] include', null], ['[[String]] exclude', null]],  //[['s','name','cool awesome']]
        ['user id'], //['parts id name story public owner{id firstName}'], ['user id'],
	],{fetchPolicy: 'no-cache', onCompleted:(data)=>{
        console.log(data.pack);
        const packet = {p:{}};
        ['b','i','f','s'].forEach(m=>{
            packet[m] = {};
            data.pack[m].forEach(e=> packet[m][e.id] = {v:e.v}); // come back to make r a list of objects instead of list of ids
        });
        data.pack.p.forEach(p=>{ 
            packet.p[p.id] = {t:p.t.v};//{t: p.t.map(t=> part.t[t.id])};
            //if(packet.p[p.id].t[0]=='root')
        });
        // Must change this so it creates an array for each relationship tag and pushes to that array. There might be more than one point for example !!!!!
        // data.pack.p.forEach(p=>{ 
        //     ['rp','pb','pi','pf','ps'].forEach(m=>{
        //         p[m].forEach(e=>{
        //             packet.p[p.id][packet.t[e.t.id].v] = packet[m.charAt(1)][e[m.charAt(1)].id];
        //             //packet.p[p.id][packet.t[e.t1.id].v] = packet[m.charAt(1)][e[m.charAt(1)].id];  // <<<<<<<<< forward relationship !!!!
        //             //packet.p[e[m.charAt(1)].id][packet.t[e.t2.id].v] = packet[m.charAt(1)][p.id];  // <<<<<<<<< reverse relationship !!!!
        //         });
        //     });
        // }); 
        // packet.root = pack.p[data.pack.p[0].id];
        // console.log(packet);
        set_pack(packet);
        //['p','b','i','f','s'].forEach(m=>{
        //    data.pack.p[0][m].forEach(e=> packet.roots.push(packet[m][e.id]) );
        //});
        //{p:e.p, t:e.t, b:e.b, i:e.i, f:e.f, s:e.s, r:e.r}
        // pack.p.forEach(part=>{
        //     if(part.t) part.r.forEach(r=> pack.p[r][pack.t[part.t[0]].v] = part);
        // });
        // ['p','b','i','f','s'].forEach(model=>{
        //     pack.p[0][model].forEach(id=>{
        //         pack.roots.push(pack[model][id]);
        //     });
        // });
    }}); 
    // props{partId valueId name model}
    return (
        r(Container,{fluid:true, className:'ps-4 pe-4 pt-4 pb-4'},
            r(Row, {className:'gap-3'}, //row-cols-auto  
                !data ? status && r(status) :
                    !pack.root ? 'No parts found.' : 
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


// const [data, status] = use_query('GetPack', [ //props{name model ids} root{p{id} b{id} i{id} f{id} s{id}}
// 		['pack p{id p{id t} t{id } b{id} i{id} f{id} s{id} r{id}} t{id v r} b{id v r} i{id v r} f{id v r} s{id v r}',
//             ['ID id', null], ['[String] include', null], ['[String] exclude', null]], 
//         ['user id'], //['parts id name story public owner{id firstName}'], ['user id'],
// 	],{onCompleted:(data)=>{
//         console.log(data.pack);
//         const pack = {roots:[], p:{}};
//         data.pack.p.forEach(part=>{
//             pack.p[part.id] = {};
//             ['p','t','b','i','f','s','r'].forEach(model=>{
//                 pack.p[part.id][model] = part[model].map(e=> e.id); //{p:e.p, t:e.t, b:e.b, i:e.i, f:e.f, s:e.s, r:e.r}
//             });
//         }); 
//         ['t','b','i','f','s'].forEach(model=>{
//             pack[model] = {};
//             data.pack[model].forEach(e=> pack[model][e.id] = {v:e.v, r:e.r}); // come back to make r a list of objects instead of list of ids
//         });
//         pack.p.forEach(part=>{
//             if(part.t) part.r.forEach(r=> pack.p[r][pack.t[part.t[0]].v] = part);
//         });
//         // ['p','b','i','f','s'].forEach(model=>{
//         //     pack.p[0][model].forEach(id=>{
//         //         pack.roots.push(pack[model][id]);
//         //     });
//         // });
//         console.log(pack);
//     }}); 


// pack.p.forEach(part=>{
//     if(part.t && pack.t[part.t[0]] == 'property'){ 
//         pack.p[part.p[0]][part.t[1]] = part.p[1];
//     }
// });

//const tags = [  pack.t[part.t[0]],  pack.t[part.t[1]]  ];
        //const i = tags.indexOf('property');

        // data.pack.p.forEach(part=> {
        //     pack.p[part.id] = {};//{p:e.p, t:e.t, b:e.b, i:e.i, f:e.f, s:e.s, r:e.r}
        //     ['t','b','i','f','s'].forEach(model=>{
        //         pack[model]
        //         pack.p[part.id][tag]
        //     });
        // }); 

        //data.pack.p.forEach(e=> pack.p[e.id] = {p:e.p, t:e.t, b:e.b, i:e.i, f:e.f, s:e.s, r:e.r}); //props:e.props
        // pack.p.forEach(part=>{
        //     part.props.forEach(prop=>{
        //         part[prop.name] = [];
        //         prop.ids.forEach((id)=> part[prop.name].push(pack[prop.model][id]));
        //     });
        // });
        // pack.p.forEach(part=>{
        //     part.props.forEach(prop=>{
        //         part[prop.name] = [];
        //         prop.ids.forEach((id)=> part[prop.name].push(pack[prop.model][id]));
        //     });
        // });


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