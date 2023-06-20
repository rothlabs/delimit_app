import {createElement as c} from 'react';
import {Badge as Boot_Badge} from 'react-bootstrap';
import {useS, ss, gs} from '../../app.js';

export function Badge({n}){ // more than one reason to change but okay because it's so simple?
    const name = useS(d=> d.n[n].c.name);
    const color = useS(d=> d.n[n].pick.color);
    //console.log('render node badge');
    const d = gs();
    const t = d.n[n].t;
    return (
        c(Boot_Badge, {className:d.node.meta[t].css, bg:color[4]}, (name?' '+name:'') + ' ('+d.node.meta[t].tag+')')
    )
}

export function Pickable({n, children}){
    return c('group', {
        name: 'pickable',
        //onClick(e){
        //    console.log('on click pickable');
        //    e.stopPropagation();
        //},
        onClick(e){ // onClick //onPointerDown
            e.stopPropagation(); 
            console.log('pointer down');
            ss(d=>{
                if(d.studio.mode=='design' && d.design.mode == 'erase'){
                    d.delete.node(d, n, {deep:true});
                }else{
                    const a = {deep:d.pick.deep};
                    if(d.pick.multi){d.pick.set(d, n, !d.n[n].pick.pick, a)}
                    else            {d.pick.one(d, n, a)}  
                }
            });
        },
        onPointerOver:e=> {e.stopPropagation(); ss(d=>d.pick.hover(d,n,true ));}, // should be something different from recieve state but should not commit state here
        onPointerOut:e=>  {e.stopPropagation(); ss(d=>d.pick.hover(d,n,false));},
        children:children,
    });
}