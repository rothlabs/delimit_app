import {createElement as r, useRef, useEffect, useState, forwardRef, useImperativeHandle} from 'react';
import {useGLTF} from 'drei';
import {Box3,TextureLoader} from 'three';
import {Line} from './line.js';
import {Surface} from './surface.js';
import {useThree, useLoader} from 'r3f';
import {Coincident, Vertical_Alignment, Endpoints_To_Lines, Coincident_Endpoints} from './constraint.js';
import {media_url, static_url} from '../app.js';
import {history_act_var} from './studio.js';
import {reline} from './vertex.js';

//useGLTF.preload(product.url);
//var add_constraints = true;
const bounds = new Box3();

export const Product = forwardRef(function Product(p, ref) {
	const group = useRef();
	const lines = useRef([]);
	const surfaces = useRef([]);
	const defaults = useRef([]);
	const materials = useRef({});
	const {camera} = useThree(); 
	const {nodes} = useGLTF(media_url+p.file);
	const disc_texture = useLoader(TextureLoader, static_url+'core/texture/disc.png');

	useImperativeHandle(ref,()=>{return{
        set_endpoint(args){
			lines.current.forEach(line=>line.set_endpoint(args));
        },
		set_mod(args){
			lines.current.forEach(line=>line.set_mod(args));
        },
    };});
	
	useEffect(()=>{ 
		if(group){
			bounds.setFromObject( group.current );
			const zoom_x = camera.right / (bounds.max.x - bounds.min.x);
			const zoom_y = camera.top / (bounds.max.y - bounds.min.y);
			if(zoom_x <= zoom_y) p.camera_controls.current.zoomTo(zoom_x * 1.75);//camera.zoom = zoom_x * 3;
			if(zoom_x > zoom_y)  p.camera_controls.current.zoomTo(zoom_y * 1.75);//camera.zoom = zoom_y * 3;
			camera.updateProjectionMatrix();
			//if(add_constraints){add_constraints=false; 
			const ids = new Array(); // IDs ensure the same constraint is not created more than once
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
			var tv_in_base=null, tv_in_rim=null, tv_in_mids=[];
			var tv_out_base=null, tv_out_rim=null, tv_out_mids=[];
			var iv_rear=null, iv_front=null, iv_mids=[]; 
			var ov_rear = null, ov_front=null, ov_mids=[];
			lines.current.forEach(line1 => {
				if(line1.name() == 'tv__in__base')   tv_in_base = line1;
				if(line1.name() == 'tv__in__rim')    tv_in_rim = line1;
				if(line1.name().includes('tv__in__mid')) tv_in_mids.push(line1);
				if(line1.name() == 'tv__out__base')  tv_out_base = line1;
				if(line1.name() == 'tv__out__rim')   tv_out_rim = line1;
				if(line1.name().includes('tv__out__mid')) tv_out_mids.push(line1);
				if(line1.name() == 'iv__rear')       iv_rear = line1;
				if(line1.name() == 'iv__front')      iv_front = line1;
				if(line1.name().includes('iv__mid')) iv_mids.push(line1);
				if(line1.name() == 'ov__rear')       ov_rear = line1;
				if(line1.name() == 'ov__front')      ov_front = line1;
				if(line1.name().includes('ov__mid')) ov_mids.push(line1);
				var words1=line1.name().split('__');
				lines.current.forEach(line2=>{
					var words2=line2.name().split('__');
					if(words1[0] == words2[0]){
						if(line1.name().includes('v__rear')  && line2.name().includes('v__base')) Coincident(line1,  0, line2,  0, ids);
						if(line1.name().includes('v__rear')  && line2.name().includes('v__rim'))  Coincident(line1, -1, line2,  0, ids);
						if(line1.name().includes('v__front') && line2.name().includes('v__base')) Coincident(line1,  0, line2, -1, ids);
						if(line1.name().includes('v__front') && line2.name().includes('v__rim'))  Coincident(line1, -1, line2, -1, ids);
					}
				});
			});
			Vertical_Alignment(iv_rear,  0, iv_front,  0, tv_in_base, [], ids);
			Vertical_Alignment(iv_rear, -1, iv_front, -1, tv_in_rim, [], ids);
			Vertical_Alignment(iv_rear,  0, iv_front,  0, tv_out_base, [], ids);
			Vertical_Alignment(iv_rear, -1, iv_front, -1, tv_out_rim, [], ids);
			Coincident_Endpoints(tv_in_base, tv_out_base, ids);
			Coincident_Endpoints(tv_in_rim, tv_out_rim, ids);
			for(var i=0; i<tv_in_mids.length; i++){
				Endpoints_To_Lines(iv_rear, iv_front, iv_mids[i], ids);
				Endpoints_To_Lines(ov_rear, ov_front, ov_mids[i], ids);
				Vertical_Alignment(iv_mids[i], 0, iv_mids[i], -1, tv_in_mids[i], [iv_rear, iv_front], ids);
				Vertical_Alignment(iv_mids[i], 0, iv_mids[i], -1, tv_out_mids[i], [iv_rear, iv_front], ids);
				Coincident_Endpoints(tv_in_mids[i], tv_out_mids[i], ids);
			}
			//console.log(ids);

			history_act_var({name:'record'}); 
		}
	},[group]); 

	//console.log('product render');
	return (
		r('group', {ref:group, dispose:null}, [
			...Object.entries(nodes).map((n,i)=>(!n[1].name.includes('default') ? null : //.isMesh ? null :
				r('mesh',{ref:el=>defaults.current[n[1].name]=el, key:n[1].name, geometry:n[1].geometry, position:[n[1].position.x,n[1].position.y,n[1].position.z]},  //position:n[1].position
					r('meshBasicMaterial',{ref:el=>materials.current[n[1].name]=el, map:n[1].material.map, transparent:true, toneMapped:false})//, , depthWrite:false 
				)
			)),
			...Object.entries(nodes).map((n,i)=>(!n[1].name.includes('surface') ? null : //.isMesh ? null :
				r(Surface, {ref:el=>surfaces.current[n[1].name]=el, key:n[1].name, node:n[1], ...p}) //geometry:n[1].geometry, position:n[1].position, map:n[1].material.map)
			)),
			...Object.entries(nodes).map((n,i)=>(!n[1].isLine ? null :
				r(Line, {ref:el=>lines.current[i]=el, verts:n[1].geometry.attributes.position.array, key:'line_'+i, node:n[1], point_texture:disc_texture, ...p})
			)),
		])
	)
});


//const texture = materials.current.lv.map;
			//const canvas = document.createElement('canvas');
			//canvas.width = texture.image.width;
			//canvas.height = texture.image.height;
			//const context = canvas.getContext('2d');
			//console.log(nodes);

	