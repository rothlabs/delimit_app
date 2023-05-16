import {createElement as r} from 'react';
import {Dropdown, DropdownButton, Form} from 'react-bootstrap';
import {ss, useSS} from '../../app.js'

export function Visual(){
    //const node_tags = useDS(d=> d.node_tags);
    //const excluded_node_tags = useDS(d=> d.graph.excluded_node_tags);
    //const checked = node_tags.map(t=> !excluded_node_tags.includes(t));
    function toggled(s){
        if(s) ss(d=> d.studio.menu='visual');
    }
    return(
        r(Dropdown, {}, // show:true, onToggle:s=>toggled(s)
            r(Dropdown.Toggle, {id:'visual_dropdown', className:'bi-eye', variant:'outline-primary', size: 'lg',}, ' '), //fs-4 font size to increase icon size but need to reduce padding too
            r(Dropdown.Menu, {show:true},
                r(Dropdown.Item, {href:"#/action-1"}, 'action'),
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

// ,
//         r(DropdownButton, {id:"dropdown-basic-button", title:"Dropdown button"},
//             r(Dropdown.Item, {href:"#/action-1"}, 'action'),
//             r(Dropdown.Item, {href:"#/action-2"}, 'action'),
//             r(Dropdown.Item, {href:"#/action-3"}, 'action'),
//         )

