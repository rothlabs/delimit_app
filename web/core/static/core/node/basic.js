import {createElement as c} from 'react';
import {Badge as Boot_Badge} from 'boot';
import {useD, ss, readable} from '../app.js';

export function Badge({n}){ // more than one reason to change but okay because it's so simple?
    const tag = useD(d=> d.n[n].t);
    const name = useD(d=> d.n[n].c.name);
    //console.log('render node badge');
    return (
        c(Boot_Badge, {bg:'primary'}, (name?name:'') + ' ('+readable(tag)+')')
    )
}

export function Selectable({n, children}){
    const d = useD.getState();
    const multiselect = useD(d=> d.pick.multiselect);
    const picked = useD(d=> d.n[n].picked);
    return c('group', {
        onClick: (e)=> {e.stopPropagation(); 
            if(multiselect){  ss(d=>d.pick.mod(d,n, !picked))  }else{   ss(d=>d.pick.mod(d,n,true));  }
        },
        onPointerMissed: (e)=> {if(e.which == 1 && !multiselect) ss(d=>d.pick.mod(d,n,false));},
        onPointerOver: (e)=> {e.stopPropagation(); ss(d=>d.pick.hover(d,n, true));},
        onPointerOut: (e)=> {e.stopPropagation(); ss(d=>d.pick.hover(d,n, false));},
        children:children,
    });
}
