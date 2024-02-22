import {createElement as c} from 'react';
import {
    use_store, List_View, render_badge_token, render_badge, icons,
    Center_Scroller,
} from 'delimit';

export function Blog_Post(){ 
    const root = use_store(d=> d.get.blog_post(d)); 
    const parts = use_store(d=> d.get_stems({root, term:'parts'}));
    return c('div', {},
        parts.map((node, i) => c(Part_Case, {node, key:i})),
    )
}

function Part_Case({node}){
    const type_name = use_store(d=> d.get_type_name(node)); 
    if(type_name == 'Text'){
        return c(Text, {node});
    }
}

function Text({node}){
    const source = use_store(d=> d.get_leaf({root:node, term:'source', alt:'missing source text'})); 
    return c('p', {}, // style:{whiteSpace: 'pre-wrap'}
        source,
    )
}

// function Make_Button({type}){
//     const icon = use_store(d=> d.get_leaf({root:type, terms:'icon source', alt:icons.css.cls.generic})); 
//     const name = use_store(d=> d.get.node.name(d, type)); 
//     return render_badge_token({
//         icon, name, 
//         store_action: d => {
//             const node = d.make.node({type, version:'targeted'});
//             d.pick(d, {node});
//             if(d.studio.mode == 'scene') d.scene.make_sources(d, {node});
//         },
//     });
// }