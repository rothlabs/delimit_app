import {createElement as rce, useRef, useEffect, useState} from 'react';
import {useGLTF} from 'drei';
import {Box3} from 'three';
import {Line} from 'easel/line.js';
import {useThree} from 'r3f';

const product = JSON.parse(document.getElementById('product').innerHTML);
const bounds = new Box3();

export function Product({mod_verts, selection}) {
	const group = useRef()
	const { camera } = useThree(); 
	const { nodes } = useGLTF(product.url)
	const [mods, set_mods] = useState([]);
	useEffect(()=>{
		set_mods([...mods, nodes.Scene.children.map((node)=>(
			node.geometry.attributes.position.array
		))]);
	},[nodes]);
	useEffect(()=>{
		bounds.setFromObject( group.current );
		const camera_width  = camera.right*2;
		const camera_height = camera.top  *2;
		if(camera_width < camera_height){
			camera.zoom = camera_width  / (bounds.max.x - bounds.min.x)*.75;
		}else{
			camera.zoom = camera_height / (bounds.max.y - bounds.min.y)*.75;
		}
		camera.updateProjectionMatrix();
	},[mods]); // only call useEffect when camera changes
	useEffect(()=>{
		console.log(mod_verts);
	},[mod_verts]);
	return (
		rce('group', {ref:group, dispose:null}, (mods.length>0) ? mods[0].map((verts)=>(
			rce(Line, {verts:verts, selection:selection})
		)): null)
	)
}

useGLTF.preload(product.url)

//rce('mesh', {castShadow:true, receiveShadow:true, geometry:nodes.Scene.children[0].geometry, material:new MeshLineMaterial({color: new Color('hsl(0,0%,40%)')})}),
			//rce('mesh', {castShadow:true, receiveShadow:true, geometry:nodes[1].geometry, material:new MeshLineMaterial({color: new THREE.Color('hsl(0,0%,40%)')})}),
			//<mesh castShadow receiveShadow geometry={nodes.Curve007_2.geometry} material={materials['Material.002']} />

	