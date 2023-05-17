import {createElement as r, useState, Fragment, useEffect} from 'react';
import {Row, Col, Button, ButtonGroup, Dropdown, Form, InputGroup} from 'boot';
import {use_mutation} from '../app.js';
import {show_login} from '../login.js';
import {useNavigate, useLocation} from 'rrd';
import {useReactiveVar} from 'apollo';
import {project_rv, editor_rv, no_edit_rv, no_copy_rv} from './studio.js';
import {show_copy_project} from './crud.js';

export function File_Tool(p){  // call it project or meta tool
    const navigate = useNavigate();
    //const location = useLocation();
    //const project = useReactiveVar(project_rv);
    const no_edit = useReactiveVar(no_edit_rv);
    const no_copy = useReactiveVar(no_copy_rv);
    const editor = useReactiveVar(editor_rv);
    const [show, set_show] = useState(false);
    //const [disabled, set_disabled] = useState(true);
    //const [save_disabled, set_save_disabled] = useState(true);
    //const [no_copy, set_no_copy] = useState(true);
    const [name, set_name] = useState(editor.project.name);
    const [story, set_story] = useState(editor.project.story);
    const [is_public, set_is_public] = useState(editor.project.public);
    const [edit_project, data, status, reset] = use_mutation([
        ['editProject reply', 
            ['Boolean! toNew', false], // change to int: 0=edit, 1=shallow_copy, 2=deep_copy (all it edit_mode?)
            ['String! id', editor.project.id], 
            ['String! name', name], 
            ['Boolean! public', is_public],
            ['String story', 't'+story],   /// 't' is present so the server knows story is being provided even if the user inputs nothing
            //['Upload blob', new Blob(['Empty Project File'], { type: 'text/plain' })],
            //['[ID [ID] [ID] [ID]] parts', ['t',[7,9],[5,0],[1,1]]], // if map returns empty it might be like ['t',] which causes graphql error! 
        ]
    ], 'GetProjects'); //GetProject
    //useEffect(()=>{ if(!show) reset(); },[show]);
    //useEffect(()=>{ 
    //    set_no_copy(true);
    //    if(editor.user && is_public) set_no_copy(false);
    //},[editor.user]);
    //useEffect(()=>{ 
    //    if(data && data.saveProject.project){
    //        setTimeout(()=>{ reset(); set_show(false); }, 1200);
            //navigate('/studio/'+data.saveProject.project.id);
    //    }
    //},[data]);
    //function save(to_new){
        //save_project({variables:{blob:blob, toNew:to_new}});
        //project.export_glb((blob)=>{
            //save_project({variables:{blob:blob, toNew:to_new}});
        //});
    //}
    return(
        //r(DropdownButton, {title:'', className:'bi-card-heading', variant:p.button_variant, show:show, onToggle:(s)=>set_show(s)},
        r(Dropdown, {show:show, onToggle:(s)=>set_show(s)},
            r(Dropdown.Toggle, {className:'bi-card-heading', variant:p.button_variant}, ' '),
            r(Dropdown.Menu, {},
                //alt ? r(alt) :
                    //data && data.saveProject.project ? r('p',{}, data.saveProject.response) :
                        r(Fragment,{},
                            status && r(status),
                            //r('p', {}, data ? data.saveProject.response : '...'),
                            //r('p',{}, 'Original: '+editor.project.name),
                            r(InputGroup, {className:'mb-3'}, 
                                r(InputGroup.Text, {}, 'Name'),
                                r(Form.Control, {maxLength:64, value:name, disabled:no_edit, onChange:(e)=>{
                                    set_name(e.target.value);
                                    edit_project({variables:{name:e.target.value}});
                                }}),
                            ),
                            r(InputGroup, {className:'mb-3'}, 
                                r(InputGroup.Text, {}, 'Story'),
                                r(Form.Control, {as:'textarea', maxLength:512, value:story, disabled:no_edit, onChange:(e)=>{
                                    set_story(e.target.value);
                                    edit_project({variables:{story:'t'+e.target.value}});
                                }}),
                            ),
                            r(Form.Check, {className:'mb-3', label:'Public', checked:is_public, disabled:no_edit, onChange:(e)=>{
                                set_is_public(e.target.checked);
                                edit_project({variables:{public:e.target.checked}});
                            }}),
                            r(Row,{className:'row-cols-auto'},
                                r(Col,{}, r(ButtonGroup, {},
                                    r(Button,{onClick:()=>show_copy_project([editor.project,true]), variant:'outline-primary', disabled:no_copy, className:'bi-stack'}, ' Copy'), //r('i',{className:'bi-disc'}),
                                    r(Button,{onClick:()=>show_copy_project([editor.project,true]), variant:'outline-primary', disabled:no_edit, className:'bi-layers'}, ' Shallow Copy'), //r('i',{className:'bi-files'}),
                                )),
                                no_edit && no_copy && r(Col,{}, r(Button,{onClick:()=>show_login(true), variant:'outline-primary'}, 
                                        r('i',{className:'bi-box-arrow-in-right'}), ' Sign In')),
                            )
                        )
            )
        )
    )
}


// useEffect(()=>{ 
//     disabled(true);
//     set_save_disabled(true);
//     if(editor.user && editor.user.id == editor.project.owner.id) {
//         disabled(false);
//         set_save_disabled(false);
//     }else{ if(editor.user && is_public) set_disabled(false); }
// },[editor.user]);

//r(Container, {fluid:true},
                //r(Row,{},
                    //r(Col,{},

    //const [copy_func, copy_data, copy_alt, copy_reset] = use_mutation([
    //    ['copyProject project{name}', ['String! id', p.project.id], ['String! name', name], ['String story', story]],
    //], 'GetProjects');

        //if(copy_data && copy_data.copyProject.project) {
    //    setTimeout(()=>{copy_reset(); set_show(false)}, 1500);
    //}

//r(Dropdown, {}, 
            //r(Dropdown.Toggle,{variant:'outline-primary'}, ' File'), 
            //r(Dropdown.Menu, {}, //className:'d-dropdown-menu'

//r(DropdownButton, {title:'File', className:'dropdown-menu-3'}, //className:'gap-3'

//r(Dropdown.Toggle,{}, ' File'), 

//r(Button,{onClick:()=>console.log('save'), className:'dropdown-item'}, r('i',{className:'bi-disc-fill'}), ' Save'),

//, variant:'outline-primary', className:'dropdown-item'