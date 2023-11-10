import {createElement as r, useState, Fragment, useEffect} from 'react';
import {Button, Modal, Form, InputGroup} from 'boot';
import {makeVar, useReactiveVar} from 'apollo';
import {use_mutation, use_effect} from '../app.js';
import {useNavigate} from 'rrd';

export const show_copy_project = makeVar([null,false]);
export function Copy_Project(){
    const navigate = useNavigate();
	const [project, nav] = useReactiveVar(show_copy_project);
    const [name, set_name] = useState('');
    const {mutate, data, status, reset} = use_mutation('CopyPart',[
        ['editProject reply project{id name}', 
            ['Boolean! toNew', true], 
            ['String! id', project && project.id], 
            ['String! name', name],
            ['Boolean! public', false],]
    ], 'GetProjects');
    useEffect(()=>{
        if(project) set_name(project.name);
        if(!project) setTimeout(()=> reset(), 250);
    },[project]);
    useEffect(()=>{
        if(data && data.editProject.project){ 
            setTimeout(()=> show_copy_project([null,false]), 1500)
            nav && navigate('/studio/'+data.editProject.project.id);
        }; //&& data.editProject
    },[data]);
    const key_press=(target)=> {if(target.charCode==13) mutate()}; 
	return (
		r(Modal,{show:project, onHide:()=>show_copy_project([null,false]), autoFocus:false},
      		r(Modal.Header, {closeButton:true},  
                project && r(Modal.Title, {}, 'Copy '+ project.name),
      		),
            //alt ? r(Modal.Body, {}, r(alt)) :
                //data && data.editProject.project ? r(Modal.Body, {}, r('p', {}, data.editProject.response)) :
                    //r(Fragment,{},
                        r(Modal.Body, {}, 
                            //data && r('p', {}, data.editProject.response),
                            status ? r(status) :
                                r(InputGroup, {className:'mb-3'}, 
                                    r(InputGroup.Text, {}, 'Name'),
                                    r(Form.Control, {type:'text', maxLength:64, value:name, onChange:(e)=>set_name(e.target.value), onKeyPress:key_press, autoFocus:true}),
                                ),
                        ),
                        r(Modal.Footer, {},
                            r(Button, {onClick:()=>show_copy_project([null,false]), variant:'secondary'}, 'Cancel'),
                            r(Button, {onClick:mutate}, 'Copy'),
                        )
                    //),
    	)
  	)
}

export const show_delete_project = makeVar();
export function Delete_Project(){
	const project = useReactiveVar(show_delete_project);
    const {mutate, data, status, reset} = use_mutation('DeletePart',[
        ['deleteProject reply project{name}', ['String! id', project && project.id]],
    ], 'GetProjects');
    // useEffect(()=>{
    //     if(!project) setTimeout(()=> reset(), 250);
    // },[project]);
    use_effect([!project],()=>{
        setTimeout(()=> reset(), 250);
    });
    use_effect([data],()=>{
        if(data.deleteProject.project) setTimeout(()=> show_delete_project(false), 1500);
    });
	return (
		r(Modal,{show:project, onHide:()=>show_delete_project(false), autoFocus:false},
      		r(Modal.Header, {closeButton:true},  
                project && r(Modal.Title, {}, 'Delete '+ project.name),
      		),
            //alt ? r(Modal.Body, {}, r(alt)) :
                //data && data.deleteProject.project ? r(Modal.Body, {}, r('p', {}, data.deleteProject.response)) :
                    //r(Fragment,{},
                        r(Modal.Body, {}, 
                            //data && r('p', {}, data.deleteProject.response),
                            status ? r(status) : project && r('p', {}, 'Are you sure you want to delete ' + project.name + '?')
                        ),
                        r(Modal.Footer, {},
                            r(Button, {onClick:()=>show_delete_project(false), variant:'secondary'}, 'Cancel'),
                            r(Button, {onClick:mutate}, 'Delete'),
                        )
                    //),
    	)
  	)
}