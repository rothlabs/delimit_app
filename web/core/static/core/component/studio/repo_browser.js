import {createElement as c, useEffect} from 'react';
import {Row, Col, Button, ButtonGroup, Container} from 'react-bootstrap';
import {use_store, List_View, set_store, act_on_store, 
    use_query, use_lazy_query, use_mutation, render_badge_token} from 'delimit';

export function Repo_Browser(){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    const {loading, error, data} = use_query('GetRepos');
    if(loading) return 'Loading';
    if(error) return `Error: ${error}`;
    let repos = [];
    try{
        repos = Object.entries(JSON.parse(data.repos.result));
    }catch{
        return 'Error retrieving repositories';
    }
    return repos.map(([id, {metadata:{name, story}, versions, write_access}]) => 
        c('div', {className:'d-flex gap-3 mb-5'},
            c('img', {className:'hjs', src:'holder.js/128x128', role:'button', // style:{width:128, height:128}
            }),
            c('div', {},
                c('div', {className:'h5 mt-2'}, name),
                c('div', {className:'mt-2 mb-2'}, story),
                c('div', {className:'d-flex gap-1'},
                    Object.entries(versions).map(([id, {metadata:{name}, committed}])=> 
                        !committed && c(Get_Version_Button, {name, id})
                    ),
                )
            ),
        )
    ) 
}

function Get_Version_Button({name, id}){
    const [get_version, {loading, error}] = use_lazy_query('GetVersion', {
        onCompleted:data=>{
            set_store(d=>{
                d.update_from_server_data(d, JSON.parse(data.version.result));
                d.studio.set_mode(d, 'graph');// d.studio.mode = 'graph';
            }); 
        },
    });
    if(error) return `Error: ${error}`;
    return render_badge_token({
        icon:'bi-bookmark', 
        name: loading ? 'Loading...' : name,
        active: d => d.versions.has(id),
        onClick: () => get_version({variables:{id}}),
    })
}



    // const [open_version] = use_mutation('OpenVersion', {
    //     onCompleted:data=>{
    //         console.log(data.openVersion.reply);
    //         set_store(d=>{
    //             d.receive_data(d, JSON.parse(data.openVersion.result));
    //             d.studio.mode = 'graph';
    //         }); 
    //     },
    // });

                    // onClick:e=>{
                //     const [id] = [...Object.entries(versions)].find(([id, o]) => o.metadata.name == 'Main');
                //     open_version({variables:{id}});
                // },