import {createElement as rce, useRef, useEffect, useState} from 'react';
import {useGLTF} from 'drei';
import {Box3} from 'three';
import {Line} from 'easel/line.js';
import {useThree} from 'r3f';

const product = JSON.parse(document.getElementById('product').innerHTML);
useGLTF.preload(product.url);
const bounds = new Box3();

export function Product(args) {
	const group = useRef()
	const { camera } = useThree(); 
	const { nodes } = useGLTF(product.url)
	const [fit_camera, set_fit_camera] = useState(false);
	//const [lines, set_lines] = useState([]);
	//useEffect(()=>{
	//	set_lines(nodes.Scene.children.map((node)=>( node.geometry.attributes.position.array )));
	//},[nodes]);
	
	useEffect(()=>{ // need to only call this on page load or when recenter button is pushed
		bounds.setFromObject( group.current );
		const camera_width  = camera.right*2;
		const camera_height = camera.top  *2;
		if(camera_width < camera_height){
			camera.zoom = camera_width  / (bounds.max.x - bounds.min.x)*.75;
		}else{
			camera.zoom = camera_height / (bounds.max.y - bounds.min.y)*.75;
		}
		camera.updateProjectionMatrix();
	},[fit_camera]); 

	useEffect(()=>{
		set_fit_camera(true);
	},[nodes]);

	// useEffect(()=>{ 
	// 	const current_verts = [0,0,0,1,1,0];
	// 	const closest = vtx.closest_to_endpoints(current_verts, mod_verts);
    //     const new_verts = vtx.map(mod_verts, closest.v1, closest.v2);
    //     mod_verts = vtx.replace(current_verts, closest.i1, closest.i2, new_verts);
    //     //line.update({rules: true, constrain:true, record:true});
	// 	set_mods([mod_verts, ...mods]);
	// },[mod_verts]);

	return (
		rce('group', {ref:group, dispose:null}, nodes.Scene.children.map((node)=>(
			rce(Line, {verts: node.geometry.attributes.position.array, ...args})
		)))
	)
}

//rce('mesh', {castShadow:true, receiveShadow:true, geometry:nodes.Scene.children[0].geometry, material:new MeshLineMaterial({color: new Color('hsl(0,0%,40%)')})}),
			//rce('mesh', {castShadow:true, receiveShadow:true, geometry:nodes[1].geometry, material:new MeshLineMaterial({color: new THREE.Color('hsl(0,0%,40%)')})}),
			//<mesh castShadow receiveShadow geometry={nodes.Curve007_2.geometry} material={materials['Material.002']} />

	