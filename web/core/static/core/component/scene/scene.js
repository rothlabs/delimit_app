import {createElement as c} from 'react';
import {use_store, set_store} from 'delimit';

export function Scene(){
    console.log('render top scene');
    const nodes = use_store(d=> d.get_scene_nodes(d)); 
    return c('group', {name:'graph'},
        nodes.map(node=> c(Node, {node, key:node})),
    )
}

function Node({node}){ 
    console.log('render node scene');
    const scenes = use_store(d=> d.get_scenes(d, {node}));  
}