import {createElement as r, useRef, useEffect, forwardRef, useImperativeHandle} from 'react';
import {Line} from './line.js';
import {Mirror_X, Mirror_Endpoints_X, Coincident, Vertical_Alignment, Endpoints_To_Lines, Coincident_Endpoints} from './constraint.js';

export const Sketch = forwardRef(function Sketch(p, ref) {
	const lines = useRef([]);

	useImperativeHandle(ref,()=>({
		mutate:(args)=> lines.current.forEach(line=> line.mutate(args)),
    }));
	
	useEffect(()=>{ 
		if(lines.current.length > 0){
			var tv_in_base=null, tv_in_rim=null, tv_in_mids=[]; // use an object with keys instead
			var tv_out_base=null, tv_out_rim=null, tv_out_mids=[];
			var iv_rear=null, iv_front=null, iv_base=null, iv_rim=null, iv_mids=[]; 
			var ov_rear=null, ov_front=null, ov_base=null, ov_rim=null, ov_mids=[];
			lines.current.forEach(line1 => {
				if(line1.name().includes('tv__in__base'))   tv_in_base = line1;
				if(line1.name().includes('tv__in__rim'))    tv_in_rim = line1;
				if(line1.name().includes('tv__in__mid')) 	tv_in_mids.push(line1);
				if(line1.name().includes('tv__out__base'))  tv_out_base = line1;
				if(line1.name().includes('tv__out__rim'))   tv_out_rim = line1;
				if(line1.name().includes('tv__out__mid')) 	tv_out_mids.push(line1);
				if(line1.name().includes('iv__rear'))       iv_rear = line1;
				if(line1.name().includes('iv__front'))      iv_front = line1;
				if(line1.name().includes('iv__base'))       iv_base = line1;
				if(line1.name().includes('iv__rim'))      	iv_rim = line1;
				if(line1.name().includes('iv__mid')) 		iv_mids.push(line1);
				if(line1.name().includes('ov__rear'))       ov_rear = line1;
				if(line1.name().includes('ov__front'))      ov_front = line1;
				if(line1.name().includes('ov__base'))       ov_base = line1;
				if(line1.name().includes('ov__rim'))      	ov_rim = line1;
				if(line1.name().includes('ov__mid')) 		ov_mids.push(line1);
			});
			if(tv_in_base){ // maybe add Mirror_X for iv_base and ov_base
				const triggers = [iv_rear, iv_front, ov_rear, ov_front];
				Mirror_X(iv_front, ov_front);
				Mirror_X(iv_rear, ov_rear);
				Mirror_X(ov_front, iv_front);
				Mirror_X(ov_rear, iv_rear);
				Coincident(iv_rear,   0,  iv_base,  0, triggers);
				Coincident(iv_rear,  -1,  iv_rim,   0, triggers);
				Coincident(iv_front,  0,  iv_base, -1, triggers);
				Coincident(iv_front, -1,  iv_rim,  -1, triggers);
				Coincident(ov_rear,   0,  ov_base,  0, triggers);
				Coincident(ov_rear,  -1,  ov_rim,   0, triggers);
				Coincident(ov_front,  0,  ov_base, -1, triggers);
				Coincident(ov_front, -1,  ov_rim,  -1, triggers);
				Vertical_Alignment(iv_rear,  0, iv_front,  0, tv_in_base,  triggers);
				Vertical_Alignment(iv_rear, -1, iv_front, -1, tv_in_rim,   triggers);
				Vertical_Alignment(iv_rear,  0, iv_front,  0, tv_out_base, triggers);
				Vertical_Alignment(iv_rear, -1, iv_front, -1, tv_out_rim,  triggers);
				Coincident_Endpoints(tv_in_base, tv_out_base);
				Coincident_Endpoints(tv_in_rim, tv_out_rim);
				for(var i=0; i<tv_in_mids.length; i++){
					Endpoints_To_Lines(iv_rear, iv_front, iv_mids[i], triggers);
					Endpoints_To_Lines(ov_rear, ov_front, ov_mids[i], triggers);
					Mirror_Endpoints_X(iv_mids[i], ov_mids[i]);
					Mirror_Endpoints_X(ov_mids[i], iv_mids[i]);
					Vertical_Alignment(iv_mids[i], 0, iv_mids[i], -1, tv_in_mids[i],  [iv_mids[i], ov_mids[i], ...triggers]);
					Vertical_Alignment(iv_mids[i], 0, iv_mids[i], -1, tv_out_mids[i], [iv_mids[i], ov_mids[i], ...triggers]);
					Coincident_Endpoints(tv_in_mids[i], tv_out_mids[i]);
				}
			}
		}
	},[lines]);

	return (
		r('group', {name:p.source.name}, //, dispose:null
            ...p.source.children.map((line, i)=> line.name.split('__')[0]=='line' && // n = n.child_of_name('points)
                r(Line, {ref:rf=>lines.current[i]=rf, source:line}) 
            ),
		)
	)
});



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

	