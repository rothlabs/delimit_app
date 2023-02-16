import {createElement as r, useRef, useEffect, useState, forwardRef, useImperativeHandle} from 'react';
import {useGLTF} from 'drei';
import {Box3} from 'three';
import {Line} from 'easel/line.js';
import {useThree} from 'r3f';
import {Coincident} from 'easel/constraint.js';

const product = JSON.parse(document.getElementById('product').innerHTML); 
useGLTF.preload(product.url);
const bounds = new Box3();
var add_constraints = true;

export const Product = forwardRef(function Product(p, ref) {
	const group = useRef();
	const lines = useRef([]);
	const {camera} = useThree(); 
	const {nodes} = useGLTF(product.url);
	//const [lines, set_lines] = useState();
	const [post_load, set_post_load] = useState(false);
	const [post_load_2, set_post_load_2] = useState(false);

	useImperativeHandle(ref,()=>{return{
        set_endpoint(ep){
			lines.current.forEach(line=>line.set_endpoint(ep));
        },
    };});
	
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

		set_post_load_2(true);

	},[post_load]); 

	useEffect(()=>{
		if (add_constraints){
			add_constraints = false;
			console.log(lines.current);
			lines.current.forEach(line1 => {
				lines.current.forEach(line2=> Coincident(line1, line2));
			});
		}
	},[post_load_2]); 

	useEffect(()=>{
		set_post_load(true);
	},[nodes]);

	return (
		r('group', {ref:group, dispose:null,
			//onClick:(event)=>{ if (add_constraints){
				//add_constraints = false;
				//console.log(lines.current);
				//lines.current.forEach(line1 => {
					//lines.current.forEach(line2=> Coincident(line1, line2));
				//});
			//}},
		}, nodes.Scene.children.map((node,i)=>(
			r(Line, {ref:el=>lines.current[i]=el, key:i, verts:node.geometry.attributes.position.array, ...p})
		)))
	)
});

//r('mesh', {castShadow:true, receiveShadow:true, geometry:nodes.Scene.children[0].geometry, material:new MeshLineMaterial({color: new Color('hsl(0,0%,40%)')})}),
			//r('mesh', {castShadow:true, receiveShadow:true, geometry:nodes[1].geometry, material:new MeshLineMaterial({color: new THREE.Color('hsl(0,0%,40%)')})}),
			//<mesh castShadow receiveShadow geometry={nodes.Curve007_2.geometry} material={materials['Material.002']} />

	