import {createElement as c} from 'react';
import {Badge as Boot_Badge} from 'boot';
import {useD} from '../app.js';

export function Badge({n}){ // more than one reason to change but okay because it's so simple?
    const tag = useD(d=> d.n[n].tag);
    const name = useD(d=> d.n[n].c.name);
    //console.log('render node badge');
    return (
        c(Boot_Badge, {bg:'primary'}, (name?name:'') + ' ('+tag+')')
    )
}

export function Selectable({n, children}){
    const d = useD.getState();
    const multiselect = useD(d=> d.multiselect);
    const selected = useD(d=> d.n[n].selected);
    return c('group', {
        onClick: (e)=> {e.stopPropagation(); 
            if(multiselect){  d.select(n, !selected)  }else{   d.select(n, true);  }
        },
        onPointerMissed: (e)=> {if(e.which == 1 && !multiselect) d.select(n, false);},
        onPointerOver: (e)=> {e.stopPropagation(); d.hover(n, true);},
        onPointerOut: (e)=> {e.stopPropagation(); d.hover(n, false)},
        children:children,
    });
}
