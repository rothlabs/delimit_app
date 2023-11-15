import {createElement as c, useEffect} from 'react';
import {use_query, use_mutation, ss, rs} from '../../app.js';
import {Row, Col, Button, Container, InputGroup, Form} from 'react-bootstrap';

export function Package(){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    const packages = use_query('GetPackages', [
		['packages data'],
	],{onCompleted:data=>{
        console.log(data.packages.data);
        rs(d=> d.studio.package.fetch = packages.refetch);
    }}); 
    const drop_package = use_mutation('DropPackage', [  
        ['dropPackage reply',  
            ['String team', null], 
            ['String package', null], 
        ]  
    ],{onCompleted:data=> {
        console.log(data.dropPackage.reply);
        packages.refetch();
    }}); 
    const open_nodes = use_mutation('OpenNodes', [  
        ['openNodes triples',  
            ['String team', null], 
            ['String package', null], 
        ]  
    ],{onCompleted:data=>{
        console.log(data.openNodes.triples);
    }});
    if(packages.data == undefined) return false;
    const pckgs = JSON.parse(packages.data.packages.data).list;
    return(
        //c(Row, {},
            //c(Col, {},
                pckgs.map(pkg=>
                    c(Row, {},
                        c(Col, {xs:'4'},
                            c('img', {className:'hjs', src:'holder.js/100px180', role:'button',
                                onClick:e=>{ 
                                    open_nodes.mutate({variables:{team:pkg.team, package:pkg.package}});
                                },
                            }),
                        ),
                        c(Col, {},
                            c(Button, {
                                className: 'border-0 mt-2 mb-2',
                                onClick:e=>{ 
                                    open_nodes.mutate({variables:{team:pkg.team, package:pkg.package}});
                                },
                            }, pkg.name),
                            c('p', {}, pkg.description),
                        ),
                        c(Col, {xs:'3'}, // md:'auto',
                            c(Button, {
                                className: 'border-0 mt-2 mb-2 bi-x-lg',
                                variant: 'outline-danger', size: 'sm',
                                onClick:e=>{ 
                                    drop_package.mutate({variables:{team:pkg.team, package:pkg.package}});
                                },
                            }, ' Delete')
                        ),
                    )
                ) 
            //)
        //)
    )
}