import {createElement as c, useEffect} from 'react';
import {Row, Col, Button, ButtonGroup} from 'react-bootstrap';
import {use_store, get_store, set_store, use_query, use_mutation} from 'delimit';

export function Repo(){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    use_store(d=> [...d.repo]); //{shallow:true}
    const repos = use_query('GetRepos', [
		['repos data'],
	]);
    const [drop_repo] = use_mutation('DropRepo', [  
        ['dropRepo reply',  
            ['String team'], 
            ['String repo'], 
        ]  
    ],{refetchQueries:['GetRepos']});//],{onCompleted:data=> repos.refetch() }); 
    const [open_module] = use_mutation('OpenModule', [  
        ['openModule reply module',  
            ['String team'], 
            ['String repo'], 
        ]  
    ],{onCompleted:data=>{
        set_store(d=>{
            d.receive_module(d, JSON.parse(data.openModule.module));
            d.studio.mode = 'graph';
        }); 
    }});
    const open_action = pkg =>{
        open_module({variables:{team:pkg.team, repo:pkg.repo}});
    }
    if(repos.loading) return 'Loading';
    if(repos.error) return `Error! ${repos.error}`;
    let pckgs = [];
    try{
        pckgs = JSON.parse(repos.data.repos.data).list;
    }catch{
        return 'Error retrieving repositories';
    }
    const d = get_store();
    return(
        pckgs.map(pkg=>
            c(Row, {className:'mt-2 w-75 ms-auto me-auto'}, //
                c(Col, {xs:'5'},
                    c('img', {className:'hjs', src:'holder.js/100px180', role:'button',
                        onClick:e=> open_action(pkg),
                    }),
                ),
                c(Col, {xs:'auto'},
                    d.repo.get(pkg.repo) ? c('div', {},
                        c('h5', {}, pkg.name + ' - Loaded'),
                    ) : c(Button, {className:'mb-3', onClick:e=> open_action(pkg)}, pkg.name),
                    c('p', {}, pkg.description),
                    c('p', {className:'bi-pen'}, pkg.write_access ? ' Write Access' : ' Read Only'),
                ),
                c(Col, {}, 
                    c(ButtonGroup, {vertical:true},
                        d.repo.get(pkg.repo) && c(Button, {
                            className: 'border-0 mb-2 bi-x-lg',
                            variant: 'outline-primary',
                            onClick:e=> set_store(d=> d.close.repo(d, pkg.repo)),
                        }, ' Close'),
                        c(Button, {
                            className: 'border-0 mb-2 bi-x-lg',
                            variant: 'outline-danger', size: 'sm',
                            onClick:e=>{ 
                                set_store(d=> d.confirm = {
                                    title: `Delete: ${pkg.name}`,
                                    body: `${pkg.name} - All data will be irreversibly destroyed in the repository. Proceed with caution.`,
                                    func(){
                                        drop_repo({variables:{team:pkg.team, repo:pkg.repo}});
                                    }
                                });
                            },
                        }, ' Delete')
                    ),
                ),
            )
        ) 
    )
}

//],{onCompleted:data=>{
    //    rs(d=> d.studio.repo.fetch = repos.refetch);
    //}}); 