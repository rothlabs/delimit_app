import {createElement as c, useEffect, useState} from 'react';
import {Row, Col, Container, Dropdown, Badge, Form, InputGroup} from 'boot';
import {use_d, shallow} from '../../../state/state.js';
import {use_window_size} from '../../../app.js';
//import {Part} from './part.js';
//import {Atom} from './atom.js';


export function Inspection(){
    const d = use_d.getState();//(d=> d.mutate);
    const [show, set_show] = useState(false);
    const window_size = use_window_size();
    const ids = use_d(d=> d.selection);
    const names = use_d(d=> ids.map(id=> d.name(id)), shallow); //.filter(String)
    const name = names.find(name=> name != null);
    const tags = use_d(d=> ids.map(id=> d.tag(id)), shallow);
    useEffect(()=>{
        if(window_size.width>=576){
            ids.length ? set_show(true) : set_show(false);
        }
    },[ids]);
    //console.log('render inspector');
    return (
        //c(Container, {fluid:true, className:'bg-light pt-2 pb-2'}, // pb:5,
        c(Dropdown, {show:show, onToggle:(s)=>set_show(s), autoClose:window_size.width<576},
            c(Dropdown.Toggle, {className:'bi-card-heading', variant:'outline-primary', disabled:ids.length<1}, ' '), //fs-4 font size to increase icon size but need to reduce padding too
            c(Dropdown.Menu, {},
                c(Row, {className:'row-cols-auto gap-2 mb-3'},
                    ...names.map((name, i)=>
                        c(Col,{}, // might need to add key to keep things straight 
                            c(Badge, {bg:'primary'}, (name?name:'') + ' ('+tags[i]+')')
                        ) 
                    ),
                ),
                //c(Row, {},
                    //c(Col,{},
                name && c(InputGroup, {className:'mb-3'}, 
                    c(InputGroup.Text, {}, 'Name'),
                    c(Form.Control, {maxLength:64, value:name, onChange:(e)=>{
                        d.mutate(d=>{
                            ids.forEach(id => {
                                if(d.n[id].m=='p' && d.n[id].e1.name) {
                                    d.n[d.n[id].e1.name[0]].v = e.target.value;
                                }
                            });
                        });
                        //d.mutate(e.target.value);
                    }}),
                ),
                    //)
                //)
            )
        )
    )
}
