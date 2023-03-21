import {Vector3} from 'three';



/* given float32array of 3d vertices, remove doubles. */
// export function remove_doubles(vertices) {
//   var newVertices = [];
//   var newIndices = [];
//   var vertexMap = {};
//   for (var i = 0; i < vertices.length; i += 3) {
//     var key = vertices[i] + ',' + vertices[i + 1] + ',' + vertices[i + 2];
//     if (vertexMap[key] === undefined) {
//       vertexMap[key] = newVertices.length / 3;
//       newVertices.push(vertices[i]);
//       newVertices.push(vertices[i + 1]);
//       newVertices.push(vertices[i + 2]);
//     }
//     newIndices.push(vertexMap[key]);
//   }
//   return new Float32Array(newVertices);
// }


// /* with float32array of 3D vertices representing a line, add vertices so there is never too big of a distance between consecutive vertices */
// function enforce_max_distance(vertices, maxDistance) {
//   var new_verts = [];//[vertices[0],vertices[1],vertices[2]];
//   new_verts.splice(0,0,vertices[2]);
//   new_verts.splice(0,0,vertices[1]);
//   new_verts.splice(0,0,vertices[0]);
//   for (var i = 0; i < vertices.length-5; i += 3) {
//     var x1 = vertices[i];
//     var y1 = vertices[i + 1];
//     var z1 = vertices[i + 2];
//     var x2 = vertices[(i + 3)];// % vertices.length];
//     var y2 = vertices[(i + 4)];// % vertices.length];
//     var z2 = vertices[(i + 5)];// % vertices.length];
//     var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
//     if (distance > maxDistance) {
//       var numNewVertices = Math.floor(distance / maxDistance);
//       var xIncrement = (x2 - x1) / numNewVertices;
//       var yIncrement = (y2 - y1) / numNewVertices;
//       var zIncrement = (z2 - z1) / numNewVertices;
//       for (var j = 0; j < numNewVertices; j++) {
//         new_verts.push(x1 + xIncrement * j);
//         new_verts.push(y1 + yIncrement * j);
//         new_verts.push(z1 + zIncrement * j);
//       }
//     }
//     new_verts.push(x2);
//     new_verts.push(y2);
//     new_verts.push(z2);
//   }
//   //new_verts.push(vertices[vertices.length-3]);
//   //new_verts.push(vertices[vertices.length-2]);
//   //new_verts.push(vertices[vertices.length-1]);
//   return new Float32Array(new_verts);
// }

// export function set_density(vertices, minDistance, maxDistance) {
//   /* Considering a Float32Array of 3D vertices representing line, write a function to remove vertices so that they are never too close. */
//   const new_verts = Array.from(vertices);
//   var i = 0;
//   //new_verts.splice(0,0,vertices[2]); // 0?
//   //new_verts.splice(0,0,vertices[1]);
//   //new_verts.splice(0,0,vertices[0]);
//   while (i < new_verts.length) {
//     var j = i + 3;
//     while (j < new_verts.length) {
//       var dx = new_verts[i] - new_verts[j];
//       var dy = new_verts[i + 1] - new_verts[j + 1];
//       var dz = new_verts[i + 2] - new_verts[j + 2];
//       var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
//       if (distance < minDistance) {
//         new_verts.splice(j, 3);
//       } else {
//           j += 3;
//       }
//     }
//     i += 3;
//   }
//   new_verts.push(vertices[vertices.length-3]);
//   new_verts.push(vertices[vertices.length-2]);
//   new_verts.push(vertices[vertices.length-1]); // 0?
//   return enforce_max_distance(new_verts, maxDistance);
// }

/* given an array, return first 3 elements as new array */
//export function first(verts) {
//  return verts.slice(0, 3);
///}

/* given an array, return last 3 elements as new array */
//export function last(verts) {
//  return verts.slice(verts.length - 3, verts.length);
//}

function wrap_i(verts,i){i*=3; if(i<0)i+=verts.length; return(i);}

export function vert(verts, i){
	i = wrap_i(verts, i);
  return [verts[i],verts[i+1],verts[i+2]];
}

export function vect(verts, i){
	i = wrap_i(verts, i);
  return new Vector3(verts[i],verts[i+1],verts[i+2]);
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

export function reline(verts, spacing = 2){
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
		//append_vert(new_verts, verts, -1);
		return(new Float32Array(new_verts));
	}else{
		return(verts);
	}
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
	verts = reline(verts);
	const delta1_x = endpoint1.x - verts[0];
	const delta1_y = endpoint1.y - verts[1];
	const delta1_z = endpoint1.z - verts[2];
	const delta2_x = endpoint2.x-verts[verts.length-3];
	const delta2_y = endpoint2.y-verts[verts.length-2];
	const delta2_z = endpoint2.z-verts[verts.length-1];
	for (var i = 0; i < verts.length-2; i += 3) {
		var ratio = i / (verts.length-3);
		new_verts.push(verts[i  ] + delta1_x*(1-ratio) + delta2_x*ratio);
		new_verts.push(verts[i+1] + delta1_y*(1-ratio) + delta2_y*ratio);
		new_verts.push(verts[i+2] + delta1_z*(1-ratio) + delta2_z*ratio);
	}
	return new Float32Array(new_verts);
}

// export function map(verts, endpoint1, endpoint2) {
//   verts = set_density(verts,.1,.2);
//   //var last_ratio = 0;
//   var new_verts = [];
//   for (var i = 0; i < verts.length-2; i += 3) {
//     var ratio = i / (verts.length-3);
//     //console.log(ratio-last_ratio);
//     //last_ratio = ratio;
//     var rts_x = verts[i]-verts[0];
//     var rts_y = verts[i+1]-verts[1];
//     var rts_z = verts[i+2]-verts[2];
//     var rte_x = verts[i]-verts[verts.length-3];
//     var rte_y = verts[i+1]-verts[verts.length-2];
//     var rte_z = verts[i+2]-verts[verts.length-1];
//     new_verts.push((rts_x+endpoint1.x)*(1-ratio) + (rte_x+endpoint2.x)*ratio);
//     new_verts.push((rts_y+endpoint1.y)*(1-ratio) + (rte_y+endpoint2.y)*ratio);
//     new_verts.push((rts_z+endpoint1.z)*(1-ratio) + (rte_z+endpoint2.z)*ratio);
//     //new_verts.push(0);
    
//   }
//   //new_verts = set_density(new_verts,1,2);
//   return new Float32Array(new_verts);
// }

/* given float32array of 3d vertices and start and end index and second array of vertices, replace the vertices between start and end with the second array. Use slice and/or splice. */ 
// could be made much shorter with slice and concat?
export function replace(vertices, startIndex, endIndex, replacements) {
  var backwards_replacements = false;
  startIndex *=3;
  endIndex *=3;
  if(startIndex > endIndex){
    var tmp = startIndex;
    startIndex = endIndex;
    endIndex = tmp;
    backwards_replacements = true;
  }
  var new_verts = [];
  for (var i = 0; i < vertices.length-2; i += 3) {
    if (i == startIndex){
      if(backwards_replacements){
        for (var k = replacements.length-3; k > 0; k -= 3) {
          new_verts.push(replacements[k]);
          new_verts.push(replacements[k + 1]);
          new_verts.push(replacements[k + 2]);
        }
      }else{
        for (var k = 0; k < replacements.length-2; k += 3) {
          new_verts.push(replacements[k]);
          new_verts.push(replacements[k + 1]);
          new_verts.push(replacements[k + 2]);
        }
      }
      i = endIndex;
    }else{
      new_verts.push(vertices[i]);
      new_verts.push(vertices[i + 1]);
      new_verts.push(vertices[i + 2]);
    }
  }
  //newVertices2.push(vertices[vertices.length-3]);
  //newVertices2.push(vertices[vertices.length-2]);
  //newVertices2.push(0);
  //return new Float32Array(newVertices2);
  return reline(new_verts);
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