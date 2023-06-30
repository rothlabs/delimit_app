import {createElement as c, useRef, memo, useState, useEffect} from 'react';
import {useS, useSS, useSub, gs} from '../../app.js';
//import {CatmullRomLine} from '@react-three/drei/CatmullRomLine';
//import {Plane} from '@react-three/drei/Plane';
import {Pickable} from '../node/base.js';
import {Float32BufferAttribute, PlaneGeometry, Vector3, DoubleSide, BackSide} from 'three';

// function make_surface(res_w, res_h){
//     return new THREE.PlaneGeometry(1, 1, divisions, frames.length + tailfinSlices -1);
// }
// const tv1 =  new Vector3();
// const tv2 =  new Vector3();
// const tv3 =  new Vector3();

export const Surface = memo(function Surface({n}){ 
    const color = useS(d=> d.n[n].pick.color); 
    const res_w = useS(d=> d.n[n].c.res_w); 
    const res_h = useS(d=> d.n[n].c.res_h); 
    const pts = useS(d=> d.n[n].c.pts); 
    const geo = new PlaneGeometry(1, 1, res_w, res_h);
    geo.setAttribute('position', new Float32BufferAttribute(pts.map(p=>[p.x,p.y,p.z]).flat(),3));
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    console.log('render surface');
    return(
        c(Pickable, {n:n}, // points && points.length>1 && 
            c('mesh', {
                geometry:geo,
            },
                c('meshStandardMaterial', {color:color[1], toneMapped:false, side:BackSide,}), //toneMapped:false, side:BackSide
            ),
        )
    )
})


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
//         for(let i=0; i<idx.length-3; i++){
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

// c(Fixed_Size_Group, { // renamed to Fix_Size or Static_Size
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