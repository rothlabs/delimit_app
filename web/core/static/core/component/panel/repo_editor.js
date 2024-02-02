import {createElement as c} from 'react';
import {use_store, List_View, render_token, render_badge, pickable} from 'delimit';

export function Repo_Editor(){ 
    const items = use_store(d=> [...d.repos.keys()]); 
    return c(List_View, {items, 
        render_item: repo => c(Repo, {repo}), 
    })  
}

function Repo({repo}){ 
    const versions = use_store(d=> d.get.repo.versions(d, repo)); 
    return c(List_View, {
        items:['metadata', ...versions], 
        path: repo,
        header: render_badge({repo}),
        header_props: pickable({repo, mode:'secondary'}),
        render_item: item => {
            if(item == 'metadata') return c(Metadata, {repo}); 
            return c(Version, {version:item});
        }
    });  
}

function Version({version}){
    return c(List_View, {items:['metadata'], path:version,
        header: render_badge({version}),
        header_props: pickable({version, mode:'secondary'}),
        render_item: () => c(Metadata, {version}),
    });  
}

function Metadata(item){
    const minWidth = 45;
    const [type, id] = Object.entries(item)[0];
    const name  = use_store(d=> d.get[type].name(d, id)); 
    const story = use_store(d=> d.get[type].story(d, id)); 
    const is_public = use_store(d=> d.get[type].isPublic(d, id)); 
    return[
        render_token({
            name: 'Name',
            content: ({render_name, render_input}) => [
                render_name({minWidth}),
                render_input({
                    maxLength: 64, 
                    value: name, 
                    placeholder: 'Required', 
                    store_action: (d, e) => d[type+'s'].get(id).name = e.target.value,
                }),
            ],
        }),
        render_token({
            name: 'Story',
            height: 128,
            content: ({render_name, render_input}) => [
                render_name({minWidth}),
                render_input({
                    value: story, 
                    placeholder: 'Optional', 
                    store_action: (d, e) => d[type+'s'].get(id).story = e.target.value,
                }),
            ],
        }),
        render_token({
            name: 'Public',
            content: ({render_name, render_switch}) => [
                render_name({minWidth}),
                render_switch({
                    checked: is_public, 
                    store_action: (d, e) => d[type+'s'].get(id).isPublic = e.target.checked,
                })
            ],
        }),
    ]
}