import {createElement as c, useState} from 'react';
import {Col, Button, InputGroup, Form} from 'react-bootstrap';
import {set_store, use_mutation} from 'delimit';

export function Make_Repo(){
    const [name, set_name] = useState('');
    const [story, set_story] = useState('');
    const [make_repo] = use_mutation('MakeRepo', {refetchQueries:['GetRepo']}); 
    return(
        c(Col, {className:'ps-2 pt-2 pe-2'},//{className:'grid gap-0 row-gap-3'},//{className:'mb-0 ms-0 me-0'},
            c(InputGroup, {className:'mt-2 mb-2'}, 
                c(InputGroup.Text, {}, 'Name'),
                c(Form.Control, {
                    as: 'input', 
                    maxLength: 64, 
                    value: name, 
                    placeholder: 'Required', 
                    onChange:e=> set_name(e.target.value),
                }),
            ),
            c(InputGroup, {className:'mb-2'}, 
                c(InputGroup.Text, {}, 'story'),
                c(Form.Control, {
                    as: 'textarea', 
                    value: story, 
                    placeholder: 'Optional', 
                    onChange:e=> set_story(e.target.value),
                }),
            ),
            c(Button, {
                className: 'mb-2 bi-box-seam',
                onClick(){ 
                    make_repo({variables:{name, story}});
                    set_store(d=> d.studio.panel.show = false);
                },
            }, 
                ' Make Repo'
            )
        )
    )
}
