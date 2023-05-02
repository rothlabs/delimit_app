import {createElement as c, useEffect, useState} from 'react';
import {Row, Col, Container, Dropdown, Badge} from 'boot';
import {use_d, shallow} from '../../../state/state.js';
import {use_window_size} from '../../../app.js';
//import {Part} from './part.js';
//import {Atom} from './atom.js';


export function Inspection(){
    //console.log('render inspector');
    const [show, set_show] = useState(false);
    const window_size = use_window_size();
    const ids = use_d(d=> d.selection);
    const names= use_d(d=> ids.map(id=> d.name(id)), shallow);
    const tags= use_d(d=> ids.map(id=> d.tag(id)), shallow);
    useEffect(()=>{
        if(window_size.width>=576){
            set_show(false);
            if(ids.length > 0) set_show(true);
        }
    },[ids]);
    return (
        //c(Container, {fluid:true, className:'bg-light pt-2 pb-2'}, // pb:5,
        c(Dropdown, {show:show, onToggle:(s)=>set_show(s), autoClose:window_size.width<576},
            c(Dropdown.Toggle, {className:'bi-card-heading', variant:'outline-primary', disabled:ids.length<1}, ' '), //fs-4 font size to increase icon size but need to reduce padding too
            c(Dropdown.Menu, {},
                c(Row, {className:'row-cols-auto gap-2'},
                    ...names.map((name, i)=>
                        c(Col,{}, // might need to add key to keep things straight 
                            c(Badge, {bg:'primary'}, name + ' ('+tags[i]+')')
                        ) 
                    ),
                ),
            )
        )
    )
}
