import {createElement as r} from 'react';
import {Dropdown, Form} from 'boot';
import {useDS} from '../../app.js'

export function Visual(){
    //const node_tags = useDS(d=> d.node_tags);
    //const excluded_node_tags = useDS(d=> d.graph.excluded_node_tags);
    //const checked = node_tags.map(t=> !excluded_node_tags.includes(t));
    return(
        r(Dropdown, {},
            r(Dropdown.Toggle, {className:'bi-eye', variant:'outline-primary', size: 'lg',}, ' '), //fs-4 font size to increase icon size but need to reduce padding too
            r(Dropdown.Menu, {},
                //...node_tags.map((tag, i)=>{
                //    r(Form.Check, {
                //        className:'mt-2 mb-2', 
                //        label: tag, 
                        //checked: checked[i], 
                        //onChange:(e)=> {
                        //    e.target.checked ?
                        //         :
                        //}, 
                //    })
                //}),
            )
        )
    )
}

