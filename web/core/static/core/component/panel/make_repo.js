import {createElement as c, Fragment, useState} from 'react';
import {Row, Col, Button, Container, InputGroup, Form} from 'react-bootstrap';
import {useS, gs, ss, rs, use_mutation} from '../../app.js'

export function Make_Repo(){
    const [name, set_name] = useState('');
    const [description, set_description] = useState('');
    const make_repo = use_mutation('MakeRepo', [  
        ['makeRepo reply',  
            ['String team', null], 
            ['String name', null], 
            ['String description', null], 
        ],
    ],{onCompleted:response=>{
        console.log('Made Repo: ', response.makeRepo.reply);
        gs().studio.repo.fetch();
    }}); 
    return(
        c(Col, {},//{className:'grid gap-0 row-gap-3'},//{className:'mb-0 ms-0 me-0'},
            c(InputGroup, {className:'mt-2 mb-2'}, 
                c(InputGroup.Text, {}, 'Name'),
                c(Form.Control, {
                    as: 'input', 
                    maxLength:64, 
                    value: name, 
                    placeholder: 'Required', 
                    onChange:(e)=> set_name(e.target.value),
                }),
            ),
            c(InputGroup, {className:'mb-2'}, 
                c(InputGroup.Text, {}, 'Description'),
                c(Form.Control, {
                    as: 'textarea', 
                    value: description, 
                    placeholder: 'Optional', 
                    onChange:(e)=> set_description(e.target.value),
                }),
            ),
            c(Button, {
                className: 'mb-2 bi-box-seam',
                onClick:e=>{ 
                    make_repo.mutate({variables:{name, description}});
                    rs(d=> d.studio.panel.show = false);
                },
            }, 
                ' Make Repo'
            )
        )
    )
}
