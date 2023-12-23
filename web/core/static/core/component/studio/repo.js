import {createElement as c, useEffect} from 'react';
import {Row, Col, Button, ButtonGroup, Container} from 'react-bootstrap';
import {use_store, client, set_store, commit_store, use_query, use_mutation, Token} from 'delimit';

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
        repos = Object.entries(JSON.parse(data.repo.data));
        
    }catch{
        return 'Error retrieving repositories';
    }
    return repos.map(([id, {flex:{name, story}, branch}])=> // write_access
        c('div', {className:'mb-3'},
            c('img', {className:'hjs', src:'holder.js/128x128', role:'button', // style:{width:128, height:128}
                onClick:e=>{
                    const [commit] = [...Object.entries(branch)].find(([id, o]) => o.flex.name == 'main');
                    open_repo({variables:{commit}});
                },
            }),
                //repo_map.get(repo) ? 
                //    c('h5', {}, name + ' - Loaded') :
                
                c('div', {className:'mt-2'}, name),
                c('div', {className:'mt-2 mb-2'}, story),
                //c(Token, {name, content:'name'}),
                //c(Token, {name, content:'name'}),
                Object.entries(branch).map(([commit, {flex:{name}}])=>
                    c(Token, {
                        icon: 'bi-box-seam',
                        name,
                        content:'badge',
                        onClick:e=> open_repo({variables:{commit}})
                    })
                ),
                ////c('p', {className:'bi-pen'}, write_access ? ' Write Access' : ' Read Only'),

                // c(ButtonGroup, {vertical:true},
                //     repo_map.get(repo) && c(Button, {
                //         className: 'border-0 bi-x-lg', // mb-2
                //         variant: 'outline-primary',
                //         onClick:e=> commit_store(d=> d.shut.repo(d, {repo})), // maybe should be set_store?! #1
                //     }, ' Close'),
                //     c(Button, {
                //         className: 'border-0 bi-x-lg', // mb-2
                //         variant: 'outline-danger', size: 'sm',
                //         onClick:e=>{ 
                //             set_store(d=>
                //                 d.confirm = {
                //                     title: `Delete: ${name}`,
                //                     body: `${name} - All data will be irreversibly destroyed in the repository. Proceed with caution.`,
                //                     func:()=> commit_store(d=> d.shut.repo(d, {repo, drop:true})),
                //                         //d.mutation.drop_repo({variables:{team:pkg.team, repo:pkg.repo}});
                //                 }
                //             );
                //         },
                //     }, ' Delete')
                // ),
        )
    ) 
}

// tip:{commit:{flex:{name, story}}}

        //c(Container, {fluid:true},
        //c('div', {className:'position-absolute top-0 start-50 translate-middle-x mt-5'},

                //        c(Row, {className:'w-75 ms-auto me-auto mt-5'}, //

//],{onCompleted:data=>{
    //    rs(d=> d.studio.repo.fetch = repos.refetch);
    //}}); 