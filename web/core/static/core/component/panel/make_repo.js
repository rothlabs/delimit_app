import {createElement as c, useState} from 'react';
import {InputGroup, Form} from 'react-bootstrap';
import {set_store, use_mutation, render_token} from 'delimit';

const minWidth = 45;

export function Make_Repo(){
    const [name, set_name] = useState('');
    const [story, set_story] = useState('');
    const [makeMeta, set_makeMeta] = useState(false);
    const [make_repo] = use_mutation('MakeRepo', {refetchQueries:['GetRepos']}); 
    return[
        render_token({
            name: 'Name',
            content: ({render_name, render_input}) => [
                render_name({minWidth}),
                render_input({
                    maxLength: 64, 
                    value: name, 
                    placeholder: 'Required', 
                    onChange: e => set_name(e.target.value),
                }),
            ],
        }),
        render_token({
            name: 'Story',
            height: 128,
            content: ({render_name, render_input}) => [
                render_name({minWidth}),
                render_input({
                    value: story, 
                    placeholder: 'Optional', 
                    onChange: e => set_story(e.target.value),
                }),
            ],
        }),
        render_token({
            name: 'Make Meta',
            content: ({render_name, render_switch}) => [
                render_name({minWidth}),
                render_switch({
                    checked: makeMeta, 
                    onChange: e => set_makeMeta(e.target.checked),
                })
            ],
        }),
        render_token({
            icon: 'bi-journal-bookmark',
            name: 'Make Repo',
            content: 'badge',
            store_setter(d){ 
                make_repo({variables:{name, story, makeMeta}});
                d.studio.panel.show = false;
            },
        }),
    ]
}

// c(InputGroup, {className:'mt-2 mb-2'}, 
// c(InputGroup.Text, {}, 'Name'),
// c(Form.Control, {
//     as: 'input', 
//     maxLength: 64, 
//     value: name, 
//     placeholder: 'Required', 
//     onChange:e=> set_name(e.target.value),
// }),
// ),

// c(InputGroup, {className:'mb-2'}, 
//             c(InputGroup.Text, {}, 'Story'),
//             c(Form.Control, {
//                 as: 'textarea', 
//                 value: story, 
//                 placeholder: 'Optional', 
//                 onChange:e=> set_story(e.target.value),
//             }),
//         ),

        //c(Col, {className:'ps-2 pt-2 pe-2'},//{className:'grid gap-0 row-gap-3'},//{className:'mb-0 ms-0 me-0'},
