import {createElement as r, useRef, useState, useEffect, Fragment, useImperativeHandle, forwardRef} from 'react';
import {Canvas, useThree, useFrame} from 'r3f';
import {Vector2} from 'three';
import {Project} from './project.js';
import {Line} from './line.js';
import {Toolbar} from './toolbar.js';
import {CameraControls} from 'drei';
import {useParams} from 'rrd';
import {makeVar, useReactiveVar} from 'apollo';
import {use_query, use_effect} from '../app.js';
import { Viewport } from './viewport.js';

//export const pack_rv
export const no_edit_rv = makeVar(true);
export const no_copy_rv = makeVar(true);
export const action_rv = makeVar({name:'none'});
export const editor_rv = makeVar();
export const show_points_rv = makeVar(true);
export const show_endpoints_rv = makeVar(true);
export const draw_mode_rv = makeVar('draw');
export const project_rv = makeVar();
export const selection_rv = makeVar();
export const sketches_rv = makeVar();


export function Studio(){
    return (
        r(Fragment,{}, 
            r(Toolbar),
            t(Graph),
            r('div', {name:'r3f', className:'position-absolute start-0 end-0 top-0 bottom-0', style:{zIndex: -1}},
                r(Canvas,{orthographic:true, camera:{position:[0, 0, 100]}}, //, onCreated:(state)=>raycaster=state.raycaster 
                    r(Viewport),
                )
            )
        )
    )
}

// const [data, status] = use_query('GetProject',[ // this will allow a single import and single export and all semantics will be managed in editor
//         [`project id name story file public owner{id firstName} parts{id}
//             p{id p{id} u{id} f{id} s{id}} f{id v} s{id v}`, 
//             ['String! id', useParams().id]], 
//         ['user id'],
//     ],{onCompleted:(data)=>{
//         editor_rv(data)
//         no_edit_rv(true); no_copy_rv(true);
//         if(data.user && data.user.id == data.project.owner.id) {
//             no_edit_rv(false); no_copy_rv(false);
//         }else{ if(data.user && data.project.public) no_copy_rv(false); }
//     }}); 

//!data ? status && r(status) :

//p{id p{id} u{id} f{id} s{id}}
//            f{id v} s{id v}`
// parts{id deps sups floats{id} chars{id}}
// floats{id val}
// chars{id val}

// vectors{id name x y z} 
//           lines{id name points}`