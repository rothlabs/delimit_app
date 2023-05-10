import {createElement as c, useEffect, useState} from 'react';
import {Row, Col, Container, Dropdown, Form, ButtonGroup} from 'boot';
import {useD, useDS, use_window_size} from '../../app.js';
import {Badge} from '../../node/basic.js'
import {String} from '../../node/input/string.js';
import {Float} from '../../node/input/float.js';

export function Inspect(){ 
    return (
        c(ButtonGroup, {}, 
            c(Inspect_Design),
            c(Inspect_Nodes),
        )
    )
}

function Inspect_Design(){ 
    const d = useD.getState();
    const [show, set_show] = useState(false);
    const part = useD(d=> d.design.part);
    const string_tags = useD(d=> d.inspect.string_tags);
    const float_tags = useD(d=> d.inspect.float_tags);
    useEffect(()=>{
        if(!part) set_show(false);
    },[part]);
    function toggled(s){
        set_show(false);
        if(s && part){
            d.set_select(part);
            set_show(true);
        }
    }
    //console.log('render inspector');
    return (
        c(Dropdown, {show:show, onToggle:s=>toggled(s)}, //, id:'inspect_workspace_part'
            c(Dropdown.Toggle, {
                className:'bi-box me-1', 
                variant:'outline-primary', size: 'lg', 
                disabled: part==null,
            }, ' '), //fs-4 font size to increase icon size but need to reduce padding too
            c(Dropdown.Menu, {},
                c(Row, {className:'row-cols-auto gap-2 mb-3'},
                    c(Col,{}, // might need to add key to keep things straight 
                        c(Badge, {n:part})
                    ) 
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

function Inspect_Nodes(){ 
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
        c(Dropdown, {show:show, onToggle:s=>set_show(s), autoClose:window_size.width<576, drop:'down-centered'}, //, id:'inspect_nodes'
            c(Dropdown.Toggle, {className:'bi-boxes', variant:'outline-primary', size: 'lg', disabled:nodes.length<1}, ' '), //fs-4 font size to increase icon size but need to reduce padding too
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


