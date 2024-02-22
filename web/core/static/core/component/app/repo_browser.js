import {createElement as c, useEffect} from 'react';
import {use_store, List_View, set_store, act_on_store, 
    use_query, use_lazy_query, use_mutation, render_badge_token} from 'delimit';

export function Repo_Browser({show_meta=true, required=[], exclude=[], post_load}){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    const {loading, error, data} = use_query('GetRepos', {variables:{requiredMeta:required, excludeMeta:exclude}});
    if(loading) return 'Loading';
    if(error) return `Error: ${error}`;
    let repos = [];
    try{
        repos = Object.entries(JSON.parse(data.repos.result));
    }catch{
        return 'Error retrieving repositories';
    }
    return repos.map(([id, {metadata, versions, writable}]) => 
        c('div', {className:'d-flex gap-3 mb-5'},
            c(Image_Button, {versions, post_load}),
            c('div', {className:'pt-1'},
                c(Title_Link, {name:metadata.name, versions, post_load}),
                c('div', {className:'mt-2 mb-2'}, metadata.story),
                show_meta && c('div', {className:'d-flex gap-1 mb-1'},
                    metadata.isPublic && render_badge_token({icon:'bi-globe-europe-africa', name:'Public'}),
                    writable && render_badge_token({icon:'bi-pencil-square', name:'Write Access'}),
                ),
                show_meta && c('div', {className:'d-flex gap-1'},
                    Object.entries(versions).map(([id, {metadata:{name}, committed}])=> 
                        !committed && c(Version_Button, {name, id, post_load})
                    ),
                )
            ),
        )
    ) 
}

function Image_Button({versions, post_load}){
    const id = get_main_version(versions);
    const [get_version, {loading, error}] = use_version_query(post_load);
    if(error) return `Error: ${error}`;
    if(loading) return render_badge_token({
        icon:'bi-hourglass-split', name:'Loading...',
        width: 150, height: 150,
    });
    return c('img', {className:'hjs', src:'holder.js/150x150', role:'button', 
        onClick: () => get_version({variables:{id}}),
    });
}

function Title_Link({name, versions, post_load}){
    const id = get_main_version(versions);
    const [get_version, {loading, error}] = use_version_query(post_load);
    if(error) return `Error: ${error}`;
    if(loading) return render_badge_token({icon:'bi-hourglass-split', name:'Loading...'});
    return c('a', {className:'h5 mt-2', role:'button',
        onClick: () => get_version({variables:{id}}),
    }, name);
}

function Version_Button({name, id, post_load}){
    const [get_version, {loading, error}] = use_version_query(post_load);
    if(error) return `Error: ${error}`;
    return render_badge_token({
        icon:'bi-bookmark', 
        name: loading ? 'Loading...' : name,
        active: d => d.versions.has(id),
        onClick: () => get_version({variables:{id}}),
    })
}

function use_version_query(post_load){
    return use_lazy_query('GetVersion', {
        onCompleted:data=>{
            set_store(d=>{
                d.update_from_server_data(d, JSON.parse(data.version.result));
                post_load(d);//d.studio.set_mode(d, 'graph');// d.studio.mode = 'graph';
            }); 
        },
    });
}

function get_main_version(versions){
    for(const [id, {metadata:{name}}] of Object.entries(versions)){
        if(name == 'Main') return id;
    }
    return '';
}