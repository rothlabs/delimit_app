import {createElement as c, useRef, memo, useState, useEffect} from 'react';
import {useS, useSubS, useSub, gs} from '../../app.js';
//import {CatmullRomLine} from '@react-three/drei/CatmullRomLine';
import {Grid} from '@react-three/drei/Grid';
import {Pickable} from '../node/base.js';
import {ShapeGeometry, Float32BufferAttribute, PlaneGeometry, Vector3, DoubleSide, FrontSide, BackSide, CircleGeometry} from 'three';
import {Fix_Size} from '../base/base.js';
import {useThree, useFrame} from '@react-three/fiber';

const v1 = new Vector3();
const v2 = new Vector3();

export const Sketch = memo(({n})=>{ // rename to Sketchpad ?!?!?!?!
    const obj = useRef();
    const {camera} = useThree(); // use state selector ?!?!?!?!?! (state)=> state.camera 
    const [offset, set_offset] = useState(0);
    const point_size = useS(d=> d.point_size);
    const top_view = useS(d=> d.n[n].c.top_view); 
    const side_view = useS(d=> d.n[n].c.side_view);
    var plane_rotation = [0,0,0];
    var grid_rotation  = [Math.PI/2,0,0];
    if(top_view){
        plane_rotation = [Math.PI/2,0,0];
        grid_rotation  = [0,0,0];
    }else if(side_view){
        plane_rotation = [0,Math.PI/2,0];
        grid_rotation  = [0,0,Math.PI/2];
    }
    useFrame((state)=>{
        if(obj.current){
            state.camera.getWorldDirection(v1);
            obj.current.getWorldDirection(v2);
            if(v1.dot(v2)>0) set_offset(point_size / camera.zoom / 2) 
            else             set_offset(-point_size / camera.zoom / 2);
        }
    });
    useSubS(d=> [d.n[n].c.matrix, d.n[n].ax.matrix], c=>{ // this won't work because cast down matrix is not replaced on reckon ?!?!?!?!?!
        obj.current.position.set( 0, 0, 0 );
        obj.current.rotation.set( 0, 0, 0 );
        obj.current.scale.set( 1, 1, 1 );
        if(c[0]) obj.current.applyMatrix4(c[0]);
        if(c[1]) obj.current.applyMatrix4(c[1]);
    });

    //console.log('render surface');
    return(
        c('group', {
            ref:obj,
        },
            c(Pickable, {n:n, drawable:true}, // points && points.length>1 && 
                // c(Fix_Size, {size:6}, 
                //     c('mesh', {},
                //         c('sphereGeometry'),
                //         c('meshBasicMaterial', {color:color[0], toneMapped:false}),
                //     )
                // ),
                c('mesh',{
                    name: 'sketch',
                    position: [0,0,offset],
                    rotation: plane_rotation,
                    //visible:false,
                },
                    c('planeGeometry', {args:[200,200]}),
                    c('meshBasicMaterial', {
                        color:'yellow', 
                        toneMapped:false, 
                        side: DoubleSide, 
                        transparent:true, 
                        opacity:.2
                    }),
                ),
            ),
            c(Grid, {
                args: [200,200],
                position: [0,0,offset],
                rotation: grid_rotation,
                cellSize: 10,
                cellThickness: 1,
                cellColor: '#c4c4c4',
                sectionSize: 100,
                sectionThickness: 1,
                sectionColor: '#c77b8e',
                fadeDistance: 10000,
                fadeStrength: 0,
                followCamera: false,
                infiniteGrid: false,
                side: DoubleSide,
            }),
        )
    )
});

