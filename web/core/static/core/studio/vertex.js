import {Vector3} from 'three';

function wrap_i(verts,i){i*=3; if(i<0)i+=verts.length; return(i);}

export function vert(verts, i){
	i = wrap_i(verts, i);
	return [verts[i],verts[i+1],verts[i+2]];
}

export function vect(verts, i){ //.fromBufferAttribute ( attribute : BufferAttribute, index : Integer ) : this
	i = wrap_i(verts, i);
	return(new Vector3(verts[i],verts[i+1],verts[i+2]));
} 

export function vects(verts){
	const new_vects = [];
	for(var i=0; i<verts.length/3; i++){
		new_vects.push(vect(verts, i));
	}
	return(new_vects);
}

function append_vert(verts1,verts2,i){
	i = wrap_i(verts2, i);
	verts1.push(verts2[i  ]);
	verts1.push(verts2[i+1]);
	verts1.push(verts2[i+2]);
}

function append_vect(verts,vect){
	verts.push(vect.x);
	verts.push(vect.y);
	verts.push(vect.z);
}

export function endpoints(verts){ // use get function here 
	return new Float32Array([...vert(verts,0), ...vert(verts,-1)]);
}

export function endpoint_vects(verts){ // use get function here 
	return [vect(verts,0), vect(verts,-1)];
}

export function reline(verts, spacing = 6){
	if(verts.length > 6){
		var new_verts = [];
    	append_vert(new_verts, verts, 0);
		var i = 1;
		var v1 = vect(verts,0);
		while(i < (verts.length/3)){
			var v2 = vect(verts,i);
			var dist = v1.distanceTo(v2);
			if(Math.abs(spacing-dist) < spacing*0.2){
				v1 = vect(verts,i);
				append_vect(new_verts, v1);
				i++;
			}else{
				if(spacing < dist){
					v1.add(v2.sub(v1).normalize().multiplyScalar(spacing));
					append_vect(new_verts, v1);
				}else{
					i++;
				}	
			}
		}
		append_vert(new_verts, verts, -1);
		return(new Float32Array(new_verts));
	}else{
		return(verts);
	}
}

/* given float32array of 3d vertices and test vertex, return the vertex closest to the test vertex. */
export function closest(verts, test_vertex) {
	var closestVertex = vect(verts,0);
	var closestDistance = Infinity;
	for (var i = 0; i < verts.length/3; i++) {
		var v = vect(verts,i);
		var distance = v.distanceTo(test_vertex);
		if (distance < closestDistance) {
			closestDistance = distance;
			closestVertex = v;
		}
	}
	return {vert: closestVertex, dist: closestDistance};
}

/* given float32array 3d vertices and two test vertices, return the closet vertex for each test vertex. */
export function closest_to_endpoints(verts, endpoints_verts) {
	const vert1 = vect(endpoints_verts,0);
	const vert2 = vect(endpoints_verts,-1);
	var minDistance1 = Infinity;
	var minDistance2 = Infinity;
	var minIndex1 = 0;
	var minIndex2 = 0;
	for (var i = 0; i < verts.length/3; i ++) {
		var v = vect(verts,i);
		var distance1 = v.distanceTo(vert1);
		var distance2 = v.distanceTo(vert2);
		if (distance1 < minDistance1) {
			minDistance1 = distance1;
			minIndex1 = i;
		}
		if (distance2 < minDistance2) {
			minDistance2 = distance2;
			minIndex2 = i;
		}
	}
	return {i1:minIndex1, i2:minIndex2, v1:vect(verts,minIndex1), v2:vect(verts,minIndex2)};
}

/* map line onto two endpoints */
export function map(verts, endpoint1, endpoint2) { 
	var new_verts = [];
	const [source_endpoint1, source_endpoint2] = endpoint_vects(verts);
	const delta1 = endpoint1.clone().sub(source_endpoint1);
	const delta2 = endpoint2.clone().sub(source_endpoint2);
	const endpoint_dist = source_endpoint1.distanceTo(source_endpoint2);
	for (var i = 0; i < verts.length/3; i++) { 
		var v = vect(verts,i);
		var ratio = ((v.distanceTo(source_endpoint1) - v.distanceTo(source_endpoint2)) / endpoint_dist + 1) / 2;
		append_vect(new_verts, v.add(delta1.clone().multiplyScalar(1-ratio)).add(delta2.clone().multiplyScalar(ratio)));
	}
	return new Float32Array(new_verts);
}

/* given float32array of 3d vertices and start and end index and second array of vertices, replace the vertices between start and end with the second array. Use slice and/or splice. */ 
// could be made much shorter with slice and concat?
export function replace(vertices, startIndex, endIndex, replacements) { // use splice for this instead of loops!
	var backwards_replacements = false;
	if(startIndex > endIndex){
		var tmp = startIndex;
		startIndex = endIndex;
		endIndex = tmp;
		backwards_replacements = true;
	}
	var new_verts = [];
	for (var i = 0; i < vertices.length/3; i++) {
		if (i == startIndex){
			if(backwards_replacements){
				for (var k = replacements.length/3-1; k > 0; k--) {
					append_vert(new_verts, replacements, k);
				}
			}else{
				for (var k = 0; k < replacements.length/3; k++) {
					append_vert(new_verts, replacements, k);
				}
			}
			i = endIndex;
		}else{
			append_vert(new_verts, vertices, i);
		}
	}
	return new_verts; //return new Float32Array(newVertices2);
}

/* given a float32array, return true if any elements are NaN */
// function hasNaN(array) {
//   for (var i = 0; i < array.length; i++) {
//     if (isNaN(array[i])) {
//       return true;
//     }
//   }
//   return false;
// }

// export{set_density, closet_to_endpoints, endpoints, map, replace, first, last, get, set, vector, hasNaN}