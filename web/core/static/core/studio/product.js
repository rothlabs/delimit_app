import {createElement as r, useRef, useEffect, useState, forwardRef, useImperativeHandle} from 'react';
import {Box3, TextureLoader} from 'three';
import {Line} from './line.js';
//import {Surface} from './surface.js';
import {useThree, useLoader} from 'r3f';
import {Coincident, Vertical_Alignment, Endpoints_To_Lines, Coincident_Endpoints} from './constraint.js';
import {use_media_gltf, static_url} from '../app.js';
import {history_action} from './editor.js';
import {GLTFExporter} from './exporter.js';

const bounds = new Box3();
const exporter = new GLTFExporter();

export const Product = forwardRef(function Product(p, ref) {
	const work_group = useRef();
	const lines = useRef([]);
	//const surfaces = useRef([]);
	//const defaults = useRef([]);
	//const materials = useRef({});
	const {camera} = useThree(); 
	const disc_texture = useLoader(TextureLoader, static_url+'core/texture/disc.png');

	const nodes = use_media_gltf(p.product.file);


	useImperativeHandle(ref,()=>{return{
		set_point(args){
			lines.current.forEach(line=>line.set_point(args));
        },
        set_endpoint(args){
			lines.current.forEach(line=>line.set_endpoint(args));
        },
		set_mod(args){
			lines.current.forEach(line=>line.set_mod(args));
        },
		export_glb(callback){
			exporter.parse(work_group.current, function(buffer){
				callback(new Blob([buffer], {type:'application/octet-stream'}));
			},function(error){console.log(error);},{ binary:true });
		}
    };});
	
	useEffect(()=>{ 
		if(nodes){
			bounds.setFromObject( work_group.current );
			const zoom_x = camera.right / (bounds.max.x - bounds.min.x);
			const zoom_y = camera.top / (bounds.max.y - bounds.min.y);
			if(zoom_x <= zoom_y) p.camera_controls.current.zoomTo(zoom_x * 1.75);//camera.zoom = zoom_x * 3;
			if(zoom_x > zoom_y)  p.camera_controls.current.zoomTo(zoom_y * 1.75);//camera.zoom = zoom_y * 3;
			camera.updateProjectionMatrix();

			var tv_in_base=null, tv_in_rim=null, tv_in_mids=[];
			var tv_out_base=null, tv_out_rim=null, tv_out_mids=[];
			var iv_rear=null, iv_front=null, iv_mids=[]; 
			var ov_rear = null, ov_front=null, ov_mids=[];
			lines.current.forEach(line1 => {
				if(line1.name().includes('tv__in__base'))   tv_in_base = line1;
				if(line1.name().includes('tv__in__rim'))    tv_in_rim = line1;
				if(line1.name().includes('tv__in__mid')) 	tv_in_mids.push(line1);
				if(line1.name().includes('tv__out__base'))  tv_out_base = line1;
				if(line1.name().includes('tv__out__rim'))   tv_out_rim = line1;
				if(line1.name().includes('tv__out__mid')) 	tv_out_mids.push(line1);
				if(line1.name().includes('iv__rear'))       iv_rear = line1;
				if(line1.name().includes('iv__front'))      iv_front = line1;
				if(line1.name().includes('iv__mid')) 		iv_mids.push(line1);
				if(line1.name().includes('ov__rear'))       ov_rear = line1;
				if(line1.name().includes('ov__front'))      ov_front = line1;
				if(line1.name().includes('ov__mid')) 		ov_mids.push(line1);
				var words1=line1.name().split('__');
				lines.current.forEach(line2=>{
					var words2=line2.name().split('__');
					if(words1[1] == words2[1]){
						if(line1.name().includes('v__rear')  && line2.name().includes('v__base')) Coincident(line1,  0, line2,  0);
						if(line1.name().includes('v__rear')  && line2.name().includes('v__rim'))  Coincident(line1, -1, line2,  0);
						if(line1.name().includes('v__front') && line2.name().includes('v__base')) Coincident(line1,  0, line2, -1);
						if(line1.name().includes('v__front') && line2.name().includes('v__rim'))  Coincident(line1, -1, line2, -1);
					}
				});
			});
			if(tv_in_base && tv_in_rim && tv_in_mids && tv_out_base && tv_out_rim && tv_out_mids && iv_rear && iv_front && iv_mids && ov_rear && ov_front && ov_mids){
				Vertical_Alignment(iv_rear,  0, iv_front,  0, tv_in_base, []);
				Vertical_Alignment(iv_rear, -1, iv_front, -1, tv_in_rim, []);
				Vertical_Alignment(iv_rear,  0, iv_front,  0, tv_out_base, []);
				Vertical_Alignment(iv_rear, -1, iv_front, -1, tv_out_rim, []);
				Coincident_Endpoints(tv_in_base, tv_out_base);
				Coincident_Endpoints(tv_in_rim, tv_out_rim);
				for(var i=0; i<tv_in_mids.length; i++){
					Endpoints_To_Lines(iv_rear, iv_front, iv_mids[i]);
					Endpoints_To_Lines(ov_rear, ov_front, ov_mids[i]);
					Vertical_Alignment(iv_mids[i], 0, iv_mids[i], -1, tv_in_mids[i], [iv_rear, iv_front]);
					Vertical_Alignment(iv_mids[i], 0, iv_mids[i], -1, tv_out_mids[i], [iv_rear, iv_front]);
					Coincident_Endpoints(tv_in_mids[i], tv_out_mids[i]);
				}
			}

			history_action({name:'record', init:true}); 
		}
	},[nodes]); 


	//console.log(nodes);
	//console.log('product render');
	//console.log(work_group);
	return (
		//r('group', {ref:group, dispose:null}, 
			//r('group', {ref:export_group, dispose:null}),
			r('group', {ref:work_group, name:p.product.name}, //, dispose:null
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
				...nodes.map((n, i) => !n.name.includes('line__') ? null : // n = n.child_of_name('points)
					r(Line, {ref:l=>lines.current[i]=l, source:n, point_texture:disc_texture, ...p}) //, rand:Math.random() key:'line_'+i export_group:export_group,   verts:n[1].geometry.attributes.position.array
				),
			)
		//)
	)
});

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

	