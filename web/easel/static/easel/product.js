import {createElement as r, useRef, useEffect, useState, forwardRef, useImperativeHandle} from 'react';
import {useGLTF} from 'drei';
import {Box3} from 'three';
import {Line} from 'easel/line.js';
import {Surface} from 'easel/surface.js';
import {useThree} from 'r3f';
import {Coincident} from 'easel/constraint.js';

const product = JSON.parse(document.getElementById('product').innerHTML); 
useGLTF.preload(product.url);
const bounds = new Box3();
var add_constraints = true;

export const Product = forwardRef(function Product(p, ref) {
	const group = useRef();
	const lines = useRef([]);
	const surfaces = useRef([]);
	const defaults = useRef([]);
	const materials = useRef({});
	const {camera} = useThree(); 
	const {nodes} = useGLTF(product.url);
	const [post_load, set_post_load] = useState(false);

	useImperativeHandle(ref,()=>{return{
        set_endpoint(args){
			lines.current.forEach(line=>line.set_endpoint(args));
        },
		set_mod(args){
			lines.current.forEach(line=>line.set_mod(args));
        },
    };});
	
	useEffect(()=>{ 
		bounds.setFromObject( group.current );
		const zoom_x = camera.right / (bounds.max.x - bounds.min.x);
		const zoom_y = camera.top / (bounds.max.y - bounds.min.y);
		if(zoom_x <= zoom_y) p.camera_controls.current.zoomTo(zoom_x * 1.75);//camera.zoom = zoom_x * 3;
		if(zoom_x > zoom_y)  p.camera_controls.current.zoomTo(zoom_y * 1.75);//camera.zoom = zoom_y * 3;
		//if(zoom_x <= zoom_y) camera.zoom = zoom_x * 1.75;
		//if(zoom_x > zoom_y)  camera.zoom = zoom_y * 1.75;
		console.log(camera.zoom);
		p.camera_controls.current.zoomTo(3);
		camera.updateProjectionMatrix();
		if (add_constraints){
			add_constraints = false; 
			lines.current.forEach(line1 => {
				lines.current.forEach(line2=> Coincident(line1, line2));
			});
		}
		p.base.set_act({name:'record'}); 

		//const texture = materials.current.lv.map;
		//const canvas = document.createElement('canvas');
		//canvas.width = texture.image.width;
		//canvas.height = texture.image.height;
		//const context = canvas.getContext('2d');

	},[post_load]); 

	useEffect(()=>{
		set_post_load(true);
		console.log(nodes);
	},[nodes]);

	return (
		r('group', {ref:group, dispose:null, position:[0,0,100]}, [
			...Object.entries(nodes).map((n,i)=>(!n[1].name.includes('default') ? null : //.isMesh ? null :
				r('mesh',{ref:el=>defaults.current[i]=el, key:'default_'+i, geometry:n[1].geometry, position:n[1].position}, 
					r('meshBasicMaterial',{ref:el=>materials.current[n[1].name]=el, map:n[1].material.map, transparent:true, toneMapped:false})//, , depthWrite:false 
				)
			)),
			...Object.entries(nodes).map((n,i)=>(!n[1].name.includes('surface') ? null : //.isMesh ? null :
				r(Surface, {ref:el=>surfaces.current[i]=el, key:'surface_'+i, node:n[1], ...p}) //geometry:n[1].geometry, position:n[1].position, map:n[1].material.map)
			)),
			...Object.entries(nodes).map((n,i)=>(!n[1].isLine ? null :
				r(Line, {ref:el=>lines.current[i]=el, verts:n[1].geometry.attributes.position.array, key:'line_'+i, ...p})
			)),
		])
	)
});


	