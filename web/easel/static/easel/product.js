import {createElement as rce, useRef, useEffect, useState} from 'react';
import {useGLTF} from 'drei';
import {Box3} from 'three';
import {Line} from 'easel/line.js';
import {useThree} from 'r3f';

const product = JSON.parse(document.getElementById('product').innerHTML);

//const mods = [[]];

export function Product({selection}) {
	const sketch_group = useRef()
	const { camera } = useThree(); 
	const { nodes } = useGLTF(product.url)
	//const [lines, set_lines] = useState();
	//useEffect(()=>{
	//	nodes 
	//},[nodes]);
	useEffect(()=>{
		const bounds = new Box3();
		bounds.setFromObject( sketch_group.current );
		const camera_width  = camera.right*2;
		const camera_height = camera.top  *2;
		if(camera_width < camera_height){
				camera.zoom = camera_width  / (bounds.max.x - bounds.min.x)*.75;
		}else{
				camera.zoom = camera_height / (bounds.max.y - bounds.min.y)*.75;
		}
		camera.updateProjectionMatrix();
	},[camera]); // only call useEffect when camera changes
	return (
		rce('group', {ref:sketch_group, dispose:null}, nodes.Scene.children.map(
			(node, i)=>( rce(Line, {verts:node.geometry.attributes.position.array, selection:selection}))
		))
	)
}

useGLTF.preload(product.url)

//rce('mesh', {castShadow:true, receiveShadow:true, geometry:nodes.Scene.children[0].geometry, material:new MeshLineMaterial({color: new Color('hsl(0,0%,40%)')})}),
			//rce('mesh', {castShadow:true, receiveShadow:true, geometry:nodes[1].geometry, material:new MeshLineMaterial({color: new THREE.Color('hsl(0,0%,40%)')})}),
			//<mesh castShadow receiveShadow geometry={nodes.Curve007_2.geometry} material={materials['Material.002']} />

	