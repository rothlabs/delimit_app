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
