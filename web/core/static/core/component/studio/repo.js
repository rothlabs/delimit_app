import {createElement as c, useEffect} from 'react';
import {use_query, use_mutation, ss, rs} from '../../app.js';
import {Row, Col, Button, Container, InputGroup, Form} from 'react-bootstrap';

export function Repo(){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    const repos = use_query('GetRepos', [
		['repos data'],
	],{onCompleted:data=>{
        console.log(data.repos.data);
        rs(d=> d.studio.repo.fetch = repos.refetch);
    }}); 
    const drop_repo = use_mutation('DropRepo', [  
        ['dropRepo reply',  
            ['String team', null], 
            ['String repo', null], 
        ]  
    ],{onCompleted:data=> {
        console.log(data.dropRepo.reply);
        repos.refetch();
    }}); 
    const open_nodes = use_mutation('OpenNodes', [  
        ['openNodes reply triples',  
            ['String team', null], 
            ['String repo', null], 
        ]  
    ],{onCompleted:data=>{
        console.log(data.openNodes.reply);
        rs(d=> d.receive_triples(d, JSON.parse(data.openNodes.triples).list)); 
    }});
    if(repos.data == undefined) return false;
    const pckgs = JSON.parse(repos.data.repos.data).list;
    return(
        pckgs.map(pkg=>
            c(Row, {},
                c(Col, {xs:'4'},
                    c('img', {className:'hjs', src:'holder.js/100px180', role:'button',
                        onClick:e=>{ 
                            open_nodes.mutate({variables:{team:pkg.team, repo:pkg.repo}});
                        },
                    }),
                ),
                c(Col, {},
                    c(Button, {
                        className: 'border-0 mt-2 mb-2',
                        onClick:e=>{ 
                            open_nodes.mutate({variables:{team:pkg.team, repo:pkg.repo}});
                        },
                    }, pkg.name),
                    c('p', {}, pkg.description),
                ),
                c(Col, {xs:'3'}, // md:'auto',
                    c(Button, {
                        className: 'border-0 mt-2 mb-2 bi-x-lg',
                        variant: 'outline-danger', size: 'sm',
                        onClick:e=>{ 
                            drop_repo.mutate({variables:{team:pkg.team, repo:pkg.repo}});
                        },
                    }, ' Delete')
                ),
            )
        ) 
    )
}