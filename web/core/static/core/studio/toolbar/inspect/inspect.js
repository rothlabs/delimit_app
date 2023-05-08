import {createElement as c, useEffect, useState} from 'react';
import {Row, Col, Container, Dropdown, Form, InputGroup} from 'boot';
import {useD, useDS, use_window_size} from '../../../app.js';
import {Badge} from '../../../node/badge.js'
import {String} from '../../../node/input/string.js';
import {Float} from '../../../node/input/float.js';

// instead of useD for every single part, useD for entire node, have subscribers in store that replace the node when anything about it changes
export function Inspect(){
    const d = useD.getState();
    const [show, set_show] = useState(false);
    const window_size = use_window_size();
    const nodes = useD(d=> d.selected.nodes);
    const string_tags = useD(d=> d.inspect.string_tags);
    const float_tags = useD(d=> d.inspect.float_tags);
    useEffect(()=>{
        if(window_size.width>=576){
            nodes.length ? set_show(true) : set_show(false);
        }
    },[nodes]);
    //console.log('render inspector');
    return (
        c(Dropdown, {show:show, onToggle:(s)=>set_show(s), autoClose:window_size.width<576},
            c(Dropdown.Toggle, {className:'bi-card-heading', variant:'outline-primary', disabled:nodes.length<1}, ' '), //fs-4 font size to increase icon size but need to reduce padding too
            c(Dropdown.Menu, {},
                c(Row, {className:'row-cols-auto gap-2 mb-3'},
                    ...nodes.map(n=>
                        c(Col,{}, // might need to add key to keep things straight 
                            c(Badge, {n:n})
                        ) 
                    ),
                ),
                ...string_tags.map(t=>
                    c(String, {t:t})
                ),
                ...float_tags.map(t=>
                    c(Float, {t:t})
                ),
            )
        )
    )
}
