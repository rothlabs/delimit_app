import {createElement as c} from 'react';
import {Badge as Boot_Badge} from 'react-bootstrap';
import {useS, ss, readable} from '../../app.js';

export function Badge({n}){ // more than one reason to change but okay because it's so simple?
    const tag = useS(d=> d.n[n].t);
    const name = useS(d=> d.n[n].c.name);
    //console.log('render node badge');
    return (
        c(Boot_Badge, {bg:'primary'}, (name?name:'') + ' ('+readable(tag)+')')
    )
}

export function Pickable({n, children}){
    const d = useS.getState();
    const multi = useS(d=> d.pick.multi);
    const picked = useS(d=> d.n[n].picked);
    return c('group', {
        onClick: (e)=> {e.stopPropagation(); 
            if(multi){  ss(d=>d.pick.mod(d,n, !picked))  }else{   ss(d=>d.pick.mod(d,n,true));  }
        },
        onPointerMissed: (e)=> {if(e.which == 1 && !multi) ss(d=>d.pick.mod(d,n,false));},
        onPointerOver: (e)=> {e.stopPropagation(); ss(d=>d.pick.hover(d,n, true));},
        onPointerOut: (e)=> {e.stopPropagation(); ss(d=>d.pick.hover(d,n, false));},
        children:children,
    });
}
