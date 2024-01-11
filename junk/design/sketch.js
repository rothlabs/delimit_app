import {createElement as c, useRef, memo, useState, useEffect} from 'react';
import {useS, useSubS, useSub, gs} from '../../app.js';
import {Grid} from '@react-three/drei/Grid';
import {Pickable, Root_Transform, View_Transform} from '../node/base.js'; 
import {Vector3, DoubleSide} from 'three';
import {useThree, useFrame} from '@react-three/fiber';

const v1 = new Vector3();
const v2 = new Vector3();



export const Sketch = memo(({n})=>{ // rename to Sketchpad ?!?!?!?!
    //const obj = useRef();
    //const plane = useRef();
    ///////////const {camera} = useThree(); // use state selector ?!?!?!?!?! (state)=> state.camera 
    //const [offset, set_offset] = useState(0);
    const easel_size = useS(d=> d.easel_size); 
    const point_size = useS(d=> d.point_size);
    const color = useS(d=> d.n[n].pick.color); 
    const plane = useS(d=> d.n[n].c.plane); 
    //const side_view = useS(d=> d.n[n].c.side_view);
    //const face_camera = useS(d=> d.n[n].c.face_camera);
    let rotation = [0,0,0];
    let axis_text_a = '+X';
    let axis_text_b = '+Y';
    if(plane == 'XZ'){
        rotation = [Math.PI/2, 0, 0];
        axis_text_b = '+Z';
    }else if(plane == 'YZ'){
        rotation = [0, -Math.PI/2, 0];
        axis_text_a = '+Z';
    }
    // useFrame((state)=>{
    //     if(obj.current){
    //         state.camera.getWorldDirection(v1);
    //         obj.current.getWorldDirection(v2);
    //         if(v1.dot(v2)>0) set_offset(point_size / camera.zoom) 
    //         else             set_offset(-point_size / camera.zoom);
    //     }
    // });
    // useSubS(d=> [d.n[n].c.matrix, d.n[n].ax.matrix], c=>{ // this won't work because cast down matrix is not replaced on reckon ?!?!?!?!?!
    //     obj.current.position.set( 0, 0, 0 );
    //     obj.current.rotation.set(...rotation);
    //     obj.current.scale.set( 1, 1, 1 );
    //     if(c[0]) obj.current.applyMatrix4(c[0]);
    //     if(c[1]) obj.current.applyMatrix4(c[1]);
    // });
    //const d = gs();
    const text_material = {color: color[0], toneMapped:false,};
    const text_args = {
        font: gs().base_font, 
        fontSize: 1, 
        outlineWidth: '30%',
        outlineColor: 'white',
        anchorX: 'center',
        anchorY: 'middle',
    };
    //console.log('render surface');
    return(
        c('group', {
            //ref:obj,
            rotation: rotation,
        },
        //c(Root_Transform, {n:n, rotation:rotation},
            c(Pickable, {n:n, penable:true}, // points && points.length>1 && 
                c('group', {name: 'sketch'}, 
                    c(View_Transform, {offset_z:1},
                        c('mesh',{
                            //position: [0,0,offset],
                            visible:false,
                        },
                            c('planeGeometry', {args:[easel_size,easel_size]}),
                            c('meshBasicMaterial', {
                                color:'yellow', 
                                toneMapped:false, 
                                side: DoubleSide, 
                                //transparent:true, 
                                //opacity:.2
                            }),
                        ),
                    ),
                    c(View_Transform, {
                        size: 30, 
                        position: [200, 0, 0],
                    },
                        c('text', {...text_args, text: axis_text_a,},
                            c('meshBasicMaterial', text_material), // causing unsupported texture colorspace: undefined
                        ),
                        c('text', {...text_args, text: axis_text_a, rotation: [0,Math.PI,0],},
                            c('meshBasicMaterial', text_material), // causing unsupported texture colorspace: undefined
                        ),
                    ),
                    c(View_Transform, {
                        size: 30, 
                        position: [0, 200, 0],
                    },
                        c('text', {...text_args, text: axis_text_b,},
                            c('meshBasicMaterial', text_material), // causing unsupported texture colorspace: undefined
                        ),
                        c('text', {...text_args, text: axis_text_b, rotation: [0,Math.PI,0],},
                            c('meshBasicMaterial', text_material), // causing unsupported texture colorspace: undefined
                        ),
                    ),
                )
            ),
            //c(Offset_Z, {dist:point_size}
            c(View_Transform, {size:point_size, offset_z:1},//, position: [0,0,offset]}, 
                c('mesh', {raycast:()=>null,},
                    c('sphereGeometry'),
                    c('meshBasicMaterial', {color:'yellow', toneMapped:false, opacity:.75, transparent:true}),
                )
            ),
            c(View_Transform, {offset_z:1},
                c(Grid, {
                    args: [easel_size, easel_size],
                    //position: [0,0,offset],
                    rotation: [Math.PI/2,0,0],//grid_rotation,
                    cellSize: 10,
                    cellThickness: 1,
                    cellColor: '#c4c4c4',
                    sectionSize: 100,
                    sectionThickness: 1,
                    sectionColor: '#d63384',
                    fadeDistance: 10000,
                    fadeStrength: 0,
                    followCamera: false,
                    infiniteGrid: false,
                    side: DoubleSide,
                }),
            )
        )
    )
});

                