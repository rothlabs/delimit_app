import {createElement as c, useState} from 'react';
import {Col, Button, InputGroup, Form} from 'react-bootstrap';
import {set_store, use_mutation} from 'delimit';

export function Make_Repo(){
    const [name, set_name] = useState('');
    const [description, set_description] = useState('');
    const [make_repo] = use_mutation('MakeRepo', [  
        ['makeRepo reply',  
            ['String team'], 
            ['String name'], 
            ['String description'], 
        ],
    ],{refetchQueries:['GetRepos']}); 
    return(
        c(Col, {className:'ps-2 pt-2 pe-2'},//{className:'grid gap-0 row-gap-3'},//{className:'mb-0 ms-0 me-0'},
            c(InputGroup, {className:'mt-2 mb-2'}, 
                c(InputGroup.Text, {}, 'Name'),
                c(Form.Control, {
                    as: 'input', 
                    maxLength:64, 
                    value: name, 
                    placeholder: 'Required', 
                    onChange:e=> set_name(e.target.value),
                }),
            ),
            c(InputGroup, {className:'mb-2'}, 
                c(InputGroup.Text, {}, 'Description'),
                c(Form.Control, {
                    as: 'textarea', 
                    value: description, 
                    placeholder: 'Optional', 
                    onChange:e=> set_description(e.target.value),
                }),
            ),
            c(Button, {
                className: 'mb-2 bi-box-seam',
                onClick(){ 
                    make_repo({variables:{name, description}});
                    set_store(d=> d.studio.panel.show = false);
                },
            }, 
                ' Make Repo'
            )
        )
    )
}
