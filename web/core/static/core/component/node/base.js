import {createElement as c} from 'react';
import {Badge as Boot_Badge} from 'react-bootstrap';
import {useS, ss, rs, readable} from '../../app.js';

export function Badge({n}){ // more than one reason to change but okay because it's so simple?
    const tag = useS(d=> d.n[n].t);
    const name = useS(d=> d.n[n].c.name);
    const color = useS(d=> d.n[n].pick.color);
    //console.log('render node badge');
    return (
        c(Boot_Badge, {bg:color[4]}, (name?name:'') + ' ('+readable(tag)+')')
    )
}

export function Pickable({n, children}){
    const pick_mode = useS(d=> d.pick.mode);
    const pick = useS(d=> d.n[n].pick.pick);
    const studio_mode = useS(d=> d.studio.mode);
    const design_mode = useS(d=> d.design.mode);
    return c('group', {
        name: 'pickable',
        onClick:e=>{ e.stopPropagation(); 
            if(studio_mode=='design' && design_mode == 'erase'){
                ss(d=> d.node.delete(d, n, {deep:true}));
            }else{
                if(pick_mode=='multi'){  
                    ss(d=>d.pick.set(d, n, !pick));
                }else{   
                    ss(d=>d.pick.one(d,n));
                }  
            }
        },
        onPointerOver:e=> {e.stopPropagation(); ss(d=>d.pick.hover(d,n, true ));}, // should be something different from recieve state but should not commit state here
        onPointerOut:e=>  {e.stopPropagation(); ss(d=>d.pick.hover(d,n, false));},
        children:children,
    });
}