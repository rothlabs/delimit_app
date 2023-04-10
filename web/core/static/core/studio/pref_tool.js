import {createElement as r} from 'react';
import {Dropdown, Form} from 'boot';
import {useReactiveVar} from 'apollo';
import {show_points_rv, show_endpoints_rv} from './editor.js';

export function Pref_Tool(p){
    const show_points = useReactiveVar(show_points_rv);
    const show_endpoints = useReactiveVar(show_endpoints_rv);
    return(
        r(Dropdown, {},
            r(Dropdown.Toggle, {className:'bi-eye', variant:p.button_variant}, ' '), //fs-4 font size to increase icon size but need to reduce padding too
            r(Dropdown.Menu, {},
                r(Form.Check, {
                    className:'mt-2 mb-2', 
                    label:'Points', 
                    checked:show_points, 
                    onChange:(e)=> {
                        show_points_rv(e.target.checked); 
                        if(e.target.checked) show_endpoints_rv(true);
                    }, 
                }),
                r(Form.Check, {
                    className:'mt-2 mb-2', 
                    label:'Endpoints', 
                    checked:show_endpoints, 
                    onChange:(e)=> show_endpoints_rv(e.target.checked), 
                    disabled:show_points,
                })
            )
        )
    )
}

