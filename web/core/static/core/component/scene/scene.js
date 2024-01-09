import {createElement as c} from 'react';
import {use_store, set_store} from 'delimit';

export function Scene(){
    //console.log('render top scene');
    const roots = use_store(d=> d.scene.get_roots(d)); 
    return c('group', {name:'root_scene'},
        roots.map(id=> c(Root, {id, key:id})),
    )
}

function Root({id}){ 
    const scenes = use_store(d=> d.scene.get_scenes(d, {id}));  
    //console.log('render node scene', scenes);
}