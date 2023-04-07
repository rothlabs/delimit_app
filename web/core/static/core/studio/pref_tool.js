import {createElement as r} from 'react';
import {Dropdown, Form} from 'boot';
import {useReactiveVar} from 'apollo';
import {show_points_var, show_endpoints_var} from './editor.js';

export function Pref_Tool(p){
    const show_points = useReactiveVar(show_points_var);
    const show_endpoints = useReactiveVar(show_endpoints_var);
    return(
        r(Dropdown, {},
            r(Dropdown.Toggle, {className:'bi-eye', variant:p.button_variant}, ' '),
            r(Dropdown.Menu, {},
                r(Form.Check, {
                    className:'mt-2 mb-2', 
                    label:'Points', 
                    checked:show_points, 
                    onChange:(e)=> {
                        show_points_var(e.target.checked); 
                        if(e.target.checked) show_endpoints_var(true);
                    }, 
                }),
                r(Form.Check, {
                    className:'mt-2 mb-2', 
                    label:'Nodes', 
                    checked:show_endpoints, 
                    onChange:(e)=> show_endpoints_var(e.target.checked), 
                    disabled:show_points,
                })
            )
        )
    )
}

