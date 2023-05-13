import {createElement as c, useEffect, useState} from 'react';
import {Row, Col, Container, Dropdown, Form, ButtonGroup, Button} from 'boot';
import {ss, ssp, gs, useS, use_window_size} from '../../app.js';
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
    const d = useS.getState();
    const [show, set_show] = useState(false);
    const window_size = use_window_size();
    const part = useS(d=> d.design.part);
    const nodes = useS(d=> d.pick.nodes); 
    const string_tags = useS(d=> d.inspect.string_tags);
    const float_tags = useS(d=> d.inspect.float_tags);
    const menu = useS(d=> d.studio.menu);
    useEffect(()=>{
        if(window_size.width>=576){
            if(part && nodes.length==1 && nodes[0]==part){
                set_show(true);
                ss(d=> d.studio.menu = 'inspect_design');
            }else{ set_show(false); }
        }
    },[nodes]);
    function toggled(s){
        if(s && part){
            set_show(true);
            //menu = 'inspect_design';
            ss(d=>{ d.pick.one(d, part); d.studio.menu = 'inspect_design'; });
        }else{ set_show(false); }
    }
    //console.log('render inspector');
    return (
        c(Dropdown, {
            show: show && menu=='inspect_design', 
            onToggle:s=>toggled(s), 
            autoClose:window_size.width<576, 
            drop:'down-centered'
        }, //, id:'inspect_workspace_part'
            c(Dropdown.Toggle, {
                className:'bi-box me-1', 
                variant:'outline-primary', size: 'lg', 
                disabled: part==null,
            }, ' '), //fs-4 font size to increase icon size but need to reduce padding too
            c(Dropdown.Menu, {},
                part && c(Row, {className:'row-cols-auto gap-2 mb-3'},
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
                nodes.filter(n=>d.n[n].asset).length ? c('div', {className:''},
                    c(Button, {
                        variant: 'outline-secondary',
                        onClick:e=>ssp(d=>{  // select function does not work inside produce because it has it's own produce 
                            d.pick.delete(d);
                        }),
                    }, 'Delete'),
                ) : null,
            )
        )
    )
}

function Inspect_Nodes(){ 
    const [show, set_show] = useState(false);
    const window_size = use_window_size();
    const design_part = useS(d=> d.design.part);
    var nodes = useS(d=> d.pick.nodes); 
    if(nodes.length==1 && nodes[0]==design_part) nodes = [];
    const string_tags = useS(d=> d.inspect.string_tags);
    const float_tags = useS(d=> d.inspect.float_tags);
    const menu = useS(d=> d.studio.menu);
    useEffect(()=>{
        if(window_size.width>=576){
            if(nodes.length){
                set_show(true);
                ss(d=> d.studio.menu='inspect_nodes');
            }else{ set_show(false); }
        }
    },[nodes]);
    function toggled(s){
        if(s){
            set_show(true);
            ss(d=> d.studio.menu='inspect_nodes');
        }else{ set_show(false); }
    }
    //console.log('render inspector');
    const d = gs();
    return (
        c(Dropdown, {
            show: show && menu=='inspect_nodes', 
            onToggle: s=>toggled(s),
            autoClose:window_size.width<576, 
            drop:'down-centered'
        }, //, id:'inspect_nodes'
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
                nodes.filter(n=>d.n[n].asset).length ? c('div', {className:''},
                    c(Button, {
                        variant: 'outline-secondary',
                        onClick:e=>ssp(d=>{  // select function does not work inside produce because it has it's own produce 
                            d.pick.delete(d);
                        }),
                    }, 'Delete'),
                ) : null,
            )
        )
    )
}


