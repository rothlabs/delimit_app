import {createElement as c, useEffect} from 'react';
import {Row, Col, Button, ButtonGroup, Container} from 'react-bootstrap';
import {use_store, List_View, set_store, act_store, 
    use_query, use_mutation, render_badge_token} from 'delimit';

export function Repo_Browser(){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    const {data, error, loading} = use_query('GetRepo');
    const [open_version] = use_mutation('OpenVersion', {
        onCompleted:data=>{
            console.log(data.openVersion.reply);
            set_store(d=>{
                d.receive_data(d, JSON.parse(data.openVersion.result));
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
    return repos.map(([repo, {metadata:{name, story}, versions, write_access}]) => 
        c('div', {className:'d-flex gap-3 mb-5'},
            c('img', {className:'hjs', src:'holder.js/128x128', role:'button', // style:{width:128, height:128}
                onClick:e=>{
                    const [id] = [...Object.entries(versions)].find(([id, o]) => o.metadata.name == 'Main');
                    open_version({variables:{id}});
                },
            }),
            c('div', {},
                c('div', {className:'h5 mt-2'}, name),
                c('div', {className:'mt-2 mb-2'}, story),
                c('div', {className:'d-flex gap-1'},
                    Object.entries(versions).map(([id, {metadata:{name}}])=> 
                        render_badge_token({
                            icon:'bi-bookmark', name,
                            active: d => d.version.has(id),
                            onClick: () => open_version({variables:{id}}),
                        })
                    ),
                )
            ),
        )
    ) 
}
