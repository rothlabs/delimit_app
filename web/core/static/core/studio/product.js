import {createElement as r, useRef, useEffect, forwardRef, useImperativeHandle} from 'react';
import {Box3} from 'three';
import {Surface} from './surface.js';
import {Sketch} from './sketch.js';
import {useThree} from 'r3f';
import {use_media_glb} from '../app.js';
import {editor_act_rv, editor_qr_rv, sketches_rv} from './editor.js'; 
import {GLTFExporter} from './exporter.js';
import {useReactiveVar} from 'apollo';
//import {Bounds} from 'drei';

const bounds = new Box3();
const exporter = new GLTFExporter();

export const Product = forwardRef(function Product(p, ref) { 
	const product = useRef();
	const sketches = useRef([]);
	const surfaces = useRef([]);
	const {camera, controls} = useThree(); 
	const editor_qr = useReactiveVar(editor_qr_rv);
	const nodes = use_media_glb(editor_qr.product.file);

	useImperativeHandle(ref,()=>({
		mutate:args=> sketches.current.forEach(sketch=> sketch.mutate(args)),
		export_glb(callback){
			exporter.parse(product.current, function(buffer){
				callback(new Blob([buffer], {type:'application/octet-stream'}));
			},function(error){console.log(error);},{ binary:true, includeCustomExtensions:true });
		},
		//sketch:target=>{
			
		//},
    }));
	
	useEffect(()=>{ 
		if(nodes && controls){
			bounds.setFromObject( product.current );
			const zoom_x = camera.right / (bounds.max.x - bounds.min.x);
			const zoom_y = camera.top / (bounds.max.y - bounds.min.y);
			if(zoom_x <= zoom_y) controls.zoomTo(zoom_x * 1.75);
			if(zoom_x >  zoom_y) controls.zoomTo(zoom_y * 1.75);
			camera.updateProjectionMatrix();
			editor_act_rv({name:'record', init:true}); 
			//sketches_rv(sketches.current.map(s=>s));
		}
	},[nodes, controls]);

	return (
		r('group', {ref:product, name:editor_qr.product.name}, //, dispose:null
			...nodes.map((sketch, i) => sketch.name.split('__')[0]=='sketch' &&
				r(Sketch, {ref:rf=>sketches.current[i]=rf, source:sketch}) 
			),
			...nodes.map((surface, i) => surface.name.split('__')[0]=='surface' &&
				r(Surface, {ref:rf=>surfaces.current[i]=rf, source:surface}) 
			),
		)
	)
});


			// r('group', {name:'surface__0'},
			// 	r('group', {name:'arg__sketch__0'}),
			// 	r(Surface),
			// ),

// ...Object.entries(cloned_nodes).map((n,i)=>(!n[1].name.includes('default__') ? null : //.isMesh ? null :
				// 	r('mesh',{ref:el=>defaults.current[n[1].name]=el, geometry:n[1].geometry, position:[n[1].position.x,n[1].position.y,n[1].position.z]},  //, key:n[1].name //position:n[1].position
				// 		r('meshBasicMaterial',{ref:el=>materials.current[n[1].name]=el, map:n[1].material.map, transparent:true, toneMapped:false})//, , depthWrite:false 
				// 	)
				// )),
				// ...Object.entries(cloned_nodes).map((n,i)=>(!n[1].name.includes('surface__') ? null : //.isMesh ? null :
				// 	r(Surface, {ref:el=>surfaces.current[n[1].name]=el, node:n[1], ...p}) //geometry:n[1].geometry, position:n[1].position, map:n[1].material.map) , key:n[1].name
				// )),
				//...Object.entries(cloned_nodes).map((n,i)=>(!n[1].name.includes('line__') ? null :
					//r(Line, {ref:el=>lines.current[i]=el, node:n[1], point_texture:disc_texture, ...p})

//if(tv_in_base && tv_in_rim && tv_in_mids && tv_out_base && tv_out_rim && tv_out_mids && iv_rear && iv_front && iv_mids && ov_rear && ov_front && ov_mids){

			// if(iv_front && iv_rear && ov_front && ov_rear){
			// 	Mirror_X(iv_front, ov_front);
			// 	Mirror_X(iv_rear, ov_rear);
			// }
			// lines.current.forEach(line1 => {
			// 	var words1=line1.name().split('__');
			// 	lines.current.forEach(line2=>{
			// 		var words2=line2.name().split('__');
			// 		if(words1[1] == words2[1]){
			// 			if(line1.name().includes('v__rear')  && line2.name().includes('v__base')) Coincident(line1,  0, line2,  0);
			// 			if(line1.name().includes('v__rear')  && line2.name().includes('v__rim'))  Coincident(line1, -1, line2,  0);
			// 			if(line1.name().includes('v__front') && line2.name().includes('v__base')) Coincident(line1,  0, line2, -1);
			// 			if(line1.name().includes('v__front') && line2.name().includes('v__rim'))  Coincident(line1, -1, line2, -1);
			// 		}
			// 	});
			// });


//const {nodes} = useGLTF(media_url+p.product.file);
	//const [cloned_nodes, set_cloned_nodes] = useState([]);


	// useEffect(() => {
	// 	if(nodes){
	// 		var new_nodes = []
	// 		nodes.AuxScene.children[0].children.forEach((n)=> {
	// 			new_nodes.push(n.clone(true));
	// 			const geo = new THREE.BufferGeometry();
	// 			geo.setAttribute('position', new THREE.BufferAttribute( new Float32Array(n.geometry.attributes.position.array), 3 ));
	// 			new_nodes[new_nodes.length-1].geometry = geo;
	// 		});
	// 		console.log(new_nodes);
	// 		set_cloned_nodes(new_nodes);
	// 	}
	// }, [nodes])


//const ids = new Array(); // IDs ensure the same constraint is not created more than once

// for(var i=0; i<2; i++){ // run twice to get lines that need two different constraints between them
			// 	lines.current.forEach(line1 => {
			// 		lines.current.forEach(line2=>{
			// 			Coincident(line1, line2, ids);
			// 			if(!line1.name().includes('front') && !line1.name().includes('rear')){
			// 				if(line1.name().includes('iv') && line2.name().includes('tv__in__')){
			// 					if(line1.name().split('__')[1] == line2.name().split('__')[2]){
			// 						Vertical_Alignment(line1,line2,ids);
			// 					}
			// 				}
			// 			}
			// 		});
			// 	});
			// }

//const texture = materials.current.lv.map;
			//const canvas = document.createElement('canvas');
			//canvas.width = texture.image.width;
			//canvas.height = texture.image.height;
			//const context = canvas.getContext('2d');
			//console.log(nodes);

	