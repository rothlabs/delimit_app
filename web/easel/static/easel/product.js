import {createElement as r, useRef, useEffect, useState} from 'react';
import {useGLTF} from 'drei';
import {Box3} from 'three';
import {Line} from 'easel/line.js';
import {useThree} from 'r3f';

const product = JSON.parse(document.getElementById('product').innerHTML); 
useGLTF.preload(product.url);
const bounds = new Box3();

export function Product(p) {
	const group = useRef()
	const {camera} = useThree(); 
	const {nodes} = useGLTF(product.url);
	const [lines, set_lines] = useState();
	const [fit_camera, set_fit_camera] = useState(false);
	
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
		nodes.Scene.children.map((node)=>(
			{verts: node.geometry.attributes.position.array, ...p})
		))
		set_lines();
		set_fit_camera(true);
		p.base.set_act({name:'record'});
	},[nodes]);

	return (
		r('group', {ref:group, dispose:null}, nodes.Scene.children.map((node)=>(
			r(Line, {verts: node.geometry.attributes.position.array, ...p})
		)))
	)
}

//r('mesh', {castShadow:true, receiveShadow:true, geometry:nodes.Scene.children[0].geometry, material:new MeshLineMaterial({color: new Color('hsl(0,0%,40%)')})}),
			//r('mesh', {castShadow:true, receiveShadow:true, geometry:nodes[1].geometry, material:new MeshLineMaterial({color: new THREE.Color('hsl(0,0%,40%)')})}),
			//<mesh castShadow receiveShadow geometry={nodes.Curve007_2.geometry} material={materials['Material.002']} />

	