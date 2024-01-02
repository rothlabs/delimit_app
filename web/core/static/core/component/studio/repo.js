import {createElement as c, useEffect} from 'react';
import {Row, Col, Button, ButtonGroup, Container} from 'react-bootstrap';
import {use_store, List_View, set_store, commit_store, use_query, use_mutation, render_token} from 'delimit';

export function Repo(){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    const repo_map = use_store(d=> d.repo);//const repos = use_store(d=> [...d.repo]); //{shallow:true}
    const {data, error, loading} = use_query('GetRepo');
    const [open_commit] = use_mutation('OpenCommit', {
        onCompleted:data=>{
            console.log(data.openCommit.reply);
            set_store(d=>{
                d.receive_data(d, JSON.parse(data.openCommit.result));
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
    return repos.map(([repo, {metadata:{name, story}, versions}])=> // write_access
        c('div', {className:'mb-3'},
            c('img', {className:'hjs', src:'holder.js/128x128', role:'button', // style:{width:128, height:128}
                onClick:e=>{
                    const [commitId] = [...Object.entries(versions)].find(([id, o]) => o.metadata.name == 'main');
                    open_commit({variables:{commitId}});
                },
            }),
                //repo_map.get(repo) ? 
                //    c('h5', {}, name + ' - Loaded') :
                
                c('div', {className:'mt-2'}, name),
                c('div', {className:'mt-2 mb-2'}, story),
                //c(render_token, {name, content:'name'}),
                //c(render_token, {name, content:'name'}),


                Object.entries(versions).map(([commitId, {metadata:{name}}])=>
                    render_token({
                        icon: 'bi-box-seam',
                        name,
                        content:'badge',
                        onClick:e=> open_commit({variables:{commitId}})
                    })
                ),
                // c(List_View, {
                //     items: Object.entries(versions), 
                //     keys: version => version[0],
                //     render_item: ([commitId, {metadata:{name}}]) => {
                //         render_token({
                //             icon: 'bi-box-seam',
                //             name,
                //             content:'badge',
                //             onClick:e=> open_commit({variables:{commitId}})
                //         })
                //     }, 
                // }),


                render_token({
                    icon:    'bi-x-lg',
                    name:    'Delete',
                    content: 'badge', // rename to display ?
                    onClick: e=> {
                        set_store(d=>
                            d.confirm = {
                                title: `Delete: ${name}`,
                                body: `${name} - All data will be irreversibly destroyed in the repository. Proceed with caution.`,
                                func:()=> commit_store(d=> d.drop.repo(d, {repo})),
                            }
                        );
                    },
                }),

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