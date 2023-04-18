import {createElement as r, useEffect} from 'react';
import {Container, Card, Button, Row, Col} from 'boot';
import {Link} from 'rrd';
import {use_query} from '../app.js';
import {show_copy_project, show_delete_project} from './crud.js';

export function Studio_Browser(){
    useEffect(()=>{Holder.run({images:'.hjs'});});
    const [data, status] = use_query('GetProjects', [
		['projects id name story public owner{id firstName}'], ['user id'],
	]); 
    return (
        r(Container,{fluid:true, className:'ps-4 pe-4 pt-4 pb-4'},
            r(Row, {className:'gap-3'}, //row-cols-auto  
                !data ? status && r(status) :
                    data.projects.length<1 ? 'No projects found.' : 
                        [...data.projects.map((project,i)=>(
                            r(Col,{key:i},
                                r(Card, {style:{width:'20rem'}, className:'mx-auto'},
                                    r(Card.Img, {variant:'top', src:'holder.js/100px180', className:'hjs'}),
                                    r(Card.Body,{},
                                        r(Card.Title,{},project.name),
                                        r(Card.Text,{}, project.story),
                                        r(Row, {className:'mb-3'},
                                            r(Col, {},
                                                project.public ? r(Card.Text,{},r('i',{className:'bi-globe-europe-africa'}),r('span',{},' Public')) :
                                                    r(Card.Text,{},r('i',{className:'bi-lock-fill'}),r('span',{},' Private')),
                                            ),
                                            r(Col, {},
                                                r(Card.Text,{},r('i',{className:'bi-person-fill'}),r('span',{},' '+project.owner.firstName))
                                            ),
                                        ),
                                        r(Button, {as:Link, to:project.id, className:'w-50 me-3'}, 'Edit'),
                                        data.user && r(Button, {onClick:()=>show_copy_project([project, false]), variant:'secondary', className:'me-3'}, 'Copy'),
                                        data.user && (project.owner.id == data.user.id) && r(Button, {onClick:()=>show_delete_project(project), variant:'secondary'}, 'D'),
                                    )
                                )
                            )
                        ))]
            )
        )
    )
}