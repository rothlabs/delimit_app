import {createElement as c, useRef, memo, useState, useEffect} from 'react';
import {useS, useSS, useSub, gs} from '../../app.js';
//import {CatmullRomLine} from '@react-three/drei/CatmullRomLine';
import {Grid} from '@react-three/drei/Grid';
import {Pickable} from '../node/base.js';
import {ShapeGeometry, Float32BufferAttribute, PlaneGeometry, Vector3, DoubleSide, FrontSide, BackSide, CircleGeometry} from 'three';
import {Fix_Size} from '../base/base.js';
import {ParametricGeometry} from 'three/examples/jsm/geometries/ParametricGeometry';
import {useThree, useFrame} from '@react-three/fiber';

const v1 = new Vector3();
const v2 = new Vector3();

export const Sketch = memo(({n})=>{ // rename to Sketchpad ?!?!?!?!
    const obj = useRef();
    //const color = useS(d=> d.n[n].pick.color); 
    //const {camera} = useThree(); // use state selector ?!?!?!?!?! (state)=> state.camera 
    const [offset, set_offset] = useState(0);
    useFrame((state)=>{
        if(obj.current){
            state.camera.getWorldDirection(v1);
            obj.current.getWorldDirection(v2);
            if(v1.dot(v2)>0) set_offset(1) 
            else             set_offset(-1);
        }
    });
    useSub(d=> d.n[n].c.matrix, matrix=>{ // this won't work because cast down matrix is not replaced on reckon ?!?!?!?!?!
        if(matrix){ // obj.current && 
            obj.current.position.set(0,0,0);
            obj.current.position.applyMatrix4(matrix);
        }
    });
    //console.log('render surface');
    return(
        c('group', {
            ref:obj,
        },
            c(Pickable, {n:n}, // points && points.length>1 && 
                // c(Fix_Size, {size:6}, 
                //     c('mesh', {},
                //         c('sphereGeometry'),
                //         c('meshBasicMaterial', {color:color[0], toneMapped:false}),
                //     )
                // ),
                c('mesh',{
                    position: [0,0,offset],
                    visible:false,
                },
                    c('planeGeometry', {args:[200,200]}),
                    c('meshBasicMaterial', {
                        color:'yellow', 
                        toneMapped:false, 
                        side: DoubleSide, 
                        //transparent:true, 
                        //opacity:.2
                    }),
                ),
            ),
            c(Grid, {
                position: [0,0,offset],
                rotation: [1.5708,0,0],
                args: [200,200],
                cellSize: 10,
                cellThickness: 1,
                cellColor: '#6f6f6f',
                sectionSize: 100,
                sectionThickness: 1,
                sectionColor: '#9d4b4b',
                fadeDistance: 10000,
                fadeStrength: 0,
                followCamera: false,
                infiniteGrid: false,
                side: DoubleSide,
            }),
            
            // c('mesh', {
            //     ref: obj,
            //     geometry:geo,
            // },
            //     c('meshBasicMaterial', {color:color[1], wireframe:true, toneMapped:false, side:DoubleSide,}), //toneMapped:false, side:BackSide
            //     //c(Edges, {color: color[2]},),
            // ),
        )
    )
});


// const zp =  new Vector3(0,0,1);
// const v1 =  new Vector3();
// const v2 =  new Vector3();
// const v3 =  new Vector3();
// const v4 =  new Vector3();
// //const v5 =  new Vector3();

// const params = {
//     split:          true,       // optional, default: true
//     uvSmooth:       false,      // optional, default: false
//     preserveEdges:  false,      // optional, default: false
//     flatOnly:       true,      // optional, default: false
//     maxTriangles:   Infinity,   // optional, default: Infinity
// };

//},[surface]);
    // const shape = useS(d=> d.n[n].c.shape);
    // const [geo,set_geo] = useState(new PlaneGeometry());
    // useEffect(()=>{
    //     var geo = new ShapeGeometry(shape);
    //     geo = LoopSubdivision.modify(geo, 2, params);
    //     geo = mergeVertices(geo, 4); // try this in progressive stages of greater tolerance ?!?!?!?!
    //     set_geo(geo);
    // },[shape]);
    
    // const idx = geo.index.array;
    // const pa = geo.getAttribute('position');
    // for(let i=0; i<idx.length-3; i+=3){
    //     v1.fromBufferAttribute(pa,idx[i]);
    //     v2.fromBufferAttribute(pa,idx[i+1]);
    //     v3.fromBufferAttribute(pa,idx[i+2]);
    //     v4.copy(v2).sub(v1).cross(zp).normalize();
    //     if(v3.sub(v2).normalize().dot(v4) > 0){
    //         var tmp = idx[i];
    //         idx[i] = idx[i+1];
    //         idx[i+1] = tmp;
    //     }
    // }


//geo.setAttribute('normal', new Float32BufferAttribute(nml.map(p=>{p.normalize(); return [p.x,p.y,p.z]}).flat(),3));
    
    // const res_w = useS(d=> d.n[n].c.res_w); 
    // const res_h = useS(d=> d.n[n].c.res_h); 
    // const pts = useS(d=> d.n[n].c.pts); 
    //const geo = new PlaneGeometry(1, 1, res_w, res_h);
    // geo.setAttribute('position', new Float32BufferAttribute(pts.map(p=>[p.x,p.y,p.z]).flat(),3)); //setFromPoints
    // geo.computeVertexNormals();
    // geo.computeBoundingBox();
    // geo.computeBoundingSphere();

// export const Surface = memo(function Surface({n}){ 
//     const color = useS(d=> d.n[n].pick.color); 
//     const res_w = useS(d=> d.n[n].c.res_w); 
//     const res_h = useS(d=> d.n[n].c.res_h); 
//     const [geometry, set_geometry] = useState(new PlaneGeometry(1, 1, res_w, res_h));
//     useEffect(()=>{
//         const pts = gs().n[n].c.pts;
//         const geo = new PlaneGeometry(1, 1, res_w, res_h);
//         geo.setAttribute('position', new Float32BufferAttribute(pts.map(p=>[p.x,p.y,p.x]).flat(),3));
//         geo.computeBoundingBox();
//         geo.computeBoundingSphere();
//         const nml = [];
//         const center = new Vector3(); 
//         geo.boundingBox.getCenter(center); 
//         pts.forEach(p=>{
//             nml.push(new Vector3());
//             //center.add(p);
//         });
//         console.log('center',center);
//         //center.divideScalar(pts.length);
//         const idx = geo.index.array;
//         for(let i=0; i<idx.length-3; i+=3){
//             tv1.copy(pts[idx[i]]).sub(pts[idx[i+1]]);
//             tv2.copy(pts[idx[i]]).sub(pts[idx[i+2]]);
//             tv1.cross(tv2).normalize();
//             tv2.copy(pts[idx[i]]).add(pts[idx[i+1]]).add(pts[idx[i+2]]).divideScalar(3).sub(center).normalize();
//             if(tv2.dot(tv1) > 0) tv1.negate();
//             nml[idx[i]].add(tv1); nml[idx[i+1]].add(tv1); nml[idx[i+2]].add(tv1);
//         }
        
//         geo.setAttribute('normal', new Float32BufferAttribute(nml.map(p=>{p.normalize(); return [p.x,p.y,p.x]}).flat(),3));
        
//         set_geometry(geo);
//         console.log(geo);
//         // geometry.getAttribute('position').needsUpdate = true;
//     },[res_w, res_h]);
//     useSub(d=> d.n[n].c.pts, pts=>{ // make useSub that includes useEffect
//         if(pts){
//             // geometry.setAttribute('position', new Float32BufferAttribute(pts.map(p=>[p.x,p.y,p.x]).flat(),3));
//             // geometry.computeVertexNormals(); //geometry.computeFaceNormals();//
//             // geometry.computeBoundingBox();
//             // geometry.computeBoundingSphere();
//             // geometry.getAttribute('position').needsUpdate = true;
//             //console.log(geometry);//(pts,res_w,res_h);
//         }
//     });
//     //const pts = gs().n[n].c.pts;
//     console.log('render surface');
//     return(
//         c(Pickable, {n:n}, // points && points.length>1 && 
//             c('mesh', {
//                 geometry:geometry,
//             },
//                 c('meshStandardMaterial', {color:color[1], }), //toneMapped:false, side:BackSide
//             ),
//         )
//     )
// })





// const nml = [];
//         //const center = new Vector3(); 
//         //geo.boundingBox.getCenter(center); 
//         pts.forEach(p=>{
//             nml.push(new Vector3());
//             //center.add(p);
//         });
        //console.log('center',center);
        //center.divideScalar(pts.length);
        // const idx = geo.index.array;//.reverse()
        // for(let i=0; i<idx.length-3; i+=3){
        //     tv1.copy(pts[idx[i]]).sub(pts[idx[i+1]]);
        //     tv2.copy(pts[idx[i]]).sub(pts[idx[i+2]]);
        //     tv1.cross(tv2).normalize();
        //     //tv3.copy(pts[idx[i]]).add(pts[idx[i+1]]).add(pts[idx[i+2]]).divideScalar(3).sub(center).normalize();
        //     //if(tv3.dot(tv1) < 0) tv1.negate();
        //     nml[idx[i]].add(tv1); nml[idx[i+1]].add(tv1); nml[idx[i+2]].add(tv1);
        //     //if(tv3.dot(tv1) < 0) tv1.negate();
        // }
        
        // geo.setAttribute('normal', new Float32BufferAttribute(nml.map(p=>{p.normalize(); return [p.x,p.y,p.z]}).flat(),3));



//obj.current.geometry.setDrawRange(0,res);


//geo.computeVertexNormals(); //geo.computeFaceNormals();//




// useEffect(()=>subS(d=> d.n[n].c.point, points=>{ // make useSub that includes useEffect
    //     const curve = new CatmullRomCurve3(points.map(p=>p.pos));
    //     obj.current.geometry.setPositions(curve.getPoints(res).map(p=>[p.x, p.y, p.z]).flat()); //new Float32Array(
    // }),[]);

// c(drei_line, {
                //     ref: obj,
                //     points: points.map(p=> [p.pos.x, p.pos.y, p.pos.z]),
                //     lineWidth: 3,
                //     color: color[0],
                //     //segments: true, 
                // }),

// c(Fix_Size, { // renamed to Fix_Size or Static_Size
                    //     size: 7, // 1.5 : 1, adjust size of other items
                    //     props:{position: [p.pos.x, p.pos.y, p.pos.z+100],}
                    // },
                    //     c(Pickable, {n:p.n}, c('mesh', {name:'point', geometry:circle_geometry,},
                    //         c('meshBasicMaterial', {color:p.color, toneMapped:false}),
                    //     )),
                    // ),

// points && c(Points, {ref:p_ref, limit:1000, range:1000}, 
            //     c(PointMaterial, {size:14, vertexColors:true, toneMapped:false, transparent:true}),
            //     ...points.map(p=> c(Pickable, {n:p.n}, 
            //         c(Point, {position: [p.pos.x, p.pos.y, p.pos.z+100], color:p.color}) 
            //     )),
            // ),

//const p_ref = useRef();
// if(p_ref.current){
//     //p_ref.current.geometry.boundingSphere = bounding_sphere;
//     //console.log('render line',p_ref.current, p_ref.current.geometry); // increase bounding sphere radius or recenter?
// }