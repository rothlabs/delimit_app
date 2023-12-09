import {createElement as c, useEffect} from 'react';
import {Row, Col, Button, ButtonGroup} from 'react-bootstrap';
import {use_store, client, set_store, commit_store, use_query, use_mutation} from 'delimit';

export function Repo(){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    const repo_map = use_store(d=> d.repo);//const repos = use_store(d=> [...d.repo]); //{shallow:true}
    const {data, error, loading} = use_query('GetRepo');
    const [open_repo] = use_mutation('OpenRepo', {
        onCompleted:data=>{
            set_store(d=>{
                d.receive_data(d, JSON.parse(data.openRepo.data));
                d.studio.mode = 'graph';
            }); 
        },
    });
    if(loading) return 'Loading';
    if(error) return `Error! ${error}`;
    let repos = [];
    try{
        repos = JSON.parse(data.repo.data).list;
    }catch{
        return 'Error retrieving repositories';
    }
    return(
        repos.map(({team, repo, name, description, write_access})=>
            c(Row, {className:'mt-2 w-75 ms-auto me-auto'}, //
                c(Col, {xs:'5'},
                    c('img', {className:'hjs', src:'holder.js/100px180', role:'button',
                        onClick:e=> open_repo({variables:{client, repo}}),
                    }),
                ),
                c(Col, {xs:'auto'},
                    repo_map.get(repo) ? c('div', {},
                        c('h5', {}, name + ' - Loaded'),
                    ) : c(Button, {className:'mb-3', onClick:e=> open_repo({variables:{client, repo}})}, name),
                    c('p', {}, description),
                    c('p', {className:'bi-pen'}, write_access ? ' Write Access' : ' Read Only'),
                ),
                c(Col, {}, 
                    c(ButtonGroup, {vertical:true},
                        repo_map.get(repo) && c(Button, {
                            className: 'border-0 bi-x-lg', // mb-2
                            variant: 'outline-primary',
                            onClick:e=> commit_store(d=> d.shut.repo(d, {repo})), // maybe should be set_store?! #1
                        }, ' Close'),
                        c(Button, {
                            className: 'border-0 bi-x-lg', // mb-2
                            variant: 'outline-danger', size: 'sm',
                            onClick:e=>{ 
                                set_store(d=>
                                    d.confirm = {
                                        title: `Delete: ${name}`,
                                        body: `${name} - All data will be irreversibly destroyed in the repository. Proceed with caution.`,
                                        func:()=> commit_store(d=> d.shut.repo(d, {repo, drop:true})),
                                            //d.mutation.drop_repo({variables:{team:pkg.team, repo:pkg.repo}});
                                    }
                                );
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