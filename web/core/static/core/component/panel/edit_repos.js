import {createElement as c} from 'react';
import {use_store, List_View, render_token, Badge} from 'delimit';

export function Edit_Repos(){ 
    const items = use_store(d=> [...d.repo.keys()]); 
    return c(List_View, {items, 
        render_item: repo => c(Repo, {repo}), 
    })  
}

function Repo({repo}){
    const name = use_store(d=> d.repo.get(repo).name); 
    const items = use_store(d=> [...d.repo.get(repo).commits]); 
    return c(List_View, {items, path:repo,
        header: name,
        render_item: version => c(Version, {version}), 
    });  
}

function Version({version}){
    const name = use_store(d=> d.commit.get(version).name); 
    return render_token({
        name, 
        content: 'badge',
    });
}