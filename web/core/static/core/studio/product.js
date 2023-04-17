import {createElement as r, useRef, forwardRef, useImperativeHandle} from 'react';
import {Box3} from 'three';
import {Surface} from './surface.js';
import {Sketch} from './sketch.js';
import {useThree} from 'r3f';
import {is_type, use_effect, use_media_glb} from '../app.js';
import {action_rv, editor_rv, sketches_rv} from './editor.js'; 
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
	const editor = useReactiveVar(editor_rv);
	const nodes = use_media_glb(editor.product.file);

	useImperativeHandle(ref,()=>({
		mutate:args=> sketches.current.forEach(sketch=> sketch.mutate(args)),
		export_glb(callback){
			exporter.parse(product.current, function(buffer){
				callback(new Blob([buffer], {type:'application/octet-stream'}));
			},function(error){console.log(error);},{ binary:true});
		},
    }));
	
	// must change so it depends on a reactive variable that is set true once all parts have rendered
	use_effect([nodes, controls],()=>{ // appears to always run once but first time loading the editor the product bounds aren't there yet
		//console.log(product.current);
		bounds.setFromObject( product.current );
		const zoom_x = camera.right / (bounds.max.x - bounds.min.x);
		const zoom_y = camera.top / (bounds.max.y - bounds.min.y);
		if(zoom_x <= zoom_y) controls.zoomTo(zoom_x * 1.75);
		if(zoom_x >  zoom_y) controls.zoomTo(zoom_y * 1.75);
		camera.updateProjectionMatrix();
		action_rv({name:'record', init:true}); 
		sketches_rv({get:id=> sketches.current.find(sketch=> {if(sketch) return sketch.id==id})});
	});

	return (
		r('group', {ref:product, name:editor.product.name}, //, dispose:null
			...nodes.map((node, i)=> is_type(node,'sketch') && //sketch.name.split('__')[0]=='sketch'
				r(Sketch, {ref:rf=>sketches.current[i]=rf, source:node}) 
			),
			...nodes.map((node, i)=> is_type(node,'surface') && //node.name.split('__')[0]=='surface'
				r(Surface, {ref:rf=>surfaces.current[i]=rf, source:node}) 
			),
		)
	)
});


//...product.parts.map((p,i)=> p.v == 'sketch' && r(Sketch, {part:p}) 


//...part.d.map((p,i)=> p.v == 'line' && r(Line, {part:p}))



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

	