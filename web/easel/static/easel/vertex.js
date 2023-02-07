import * as THREE from 'three';

/* with float32array of 3D vertices representing a line, add vertices so there is never too big of a distance between consecutive vertices */
function enforce_max_distance(vertices, maxDistance) {
  var new_verts = [];//[vertices[0],vertices[1],vertices[2]];
  new_verts.splice(0,0,0);
  new_verts.splice(0,0,vertices[1]);
  new_verts.splice(0,0,vertices[0]);
  for (var i = 0; i < vertices.length-5; i += 3) {
    var x1 = vertices[i];
    var y1 = vertices[i + 1];
    var z1 = vertices[i + 2];
    var x2 = vertices[(i + 3)];// % vertices.length];
    var y2 = vertices[(i + 4)];// % vertices.length];
    var z2 = vertices[(i + 5)];// % vertices.length];
    var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
    if (distance > maxDistance) {
      var numNewVertices = Math.floor(distance / maxDistance);
      var xIncrement = (x2 - x1) / numNewVertices;
      var yIncrement = (y2 - y1) / numNewVertices;
      var zIncrement = (z2 - z1) / numNewVertices;
      for (var j = 0; j < numNewVertices; j++) {
        new_verts.push(x1 + xIncrement * j);
        new_verts.push(y1 + yIncrement * j);
        new_verts.push(z1 + zIncrement * j);
      }
    }
    new_verts.push(x2);
    new_verts.push(y2);
    new_verts.push(z2);
  }
  new_verts.push(vertices[vertices.length-3]);
  new_verts.push(vertices[vertices.length-2]);
  new_verts.push(0);
  return new Float32Array(new_verts);
}

export function set_density(vertices, minDistance, maxDistance) {
  /* Considering a Float32Array of 3D vertices representing line, write a function to remove vertices so that they are never too close. */
  const new_verts = Array.from(vertices);
  var i = 0;
  new_verts.splice(0,0,0);
  new_verts.splice(0,0,vertices[1]);
  new_verts.splice(0,0,vertices[0]);
  while (i < new_verts.length) {
    var j = i + 3;
    while (j < new_verts.length) {
      var dx = new_verts[i] - new_verts[j];
      var dy = new_verts[i + 1] - new_verts[j + 1];
      var dz = new_verts[i + 2] - new_verts[j + 2];
      var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (distance < minDistance) {
        new_verts.splice(j, 3);
      } else {
          j += 3;
      }
    }
    i += 3;
  }
  new_verts.push(vertices[vertices.length-3]);
  new_verts.push(vertices[vertices.length-2]);
  new_verts.push(0);
  return enforce_max_distance(new_verts, maxDistance);
}

/* given an array, return first 3 elements as new array */
//export function first(verts) {
//  return verts.slice(0, 3);
///}

/* given an array, return last 3 elements as new array */
//export function last(verts) {
//  return verts.slice(verts.length - 3, verts.length);
//}

export function get(verts, i){
  return [verts[i],verts[i+1],verts[i+2]];
}

export function vect(verts, i){
  i *= 3;
  if(i < 0){
    i = verts.length + i;
  }
  return new THREE.Vector3(verts[i],verts[i+1],verts[i+2]);
}

//export function set(verts, i, point){
//  i *= 3;
//  if(i < 0){
//    i = verts.length + i;
//  }
//  verts[i] = point.x;
//  verts[i+1] = point.y;
//}

export function endpoints(verts, z_offset){
  return [verts[0],verts[1],verts[2]+z_offset,  verts[verts.length-3],verts[verts.length-2],verts[verts.length-1]+z_offset];
}

/* given float32array 3d vertices and two test vertices, return the closet vertex for each test vertex. */
export function closest_to_endpoints(verts, endpoints_verts) {
  const vert1 = vect(endpoints_verts,0);//first(endpoints_verts);
  const vert2 = vect(endpoints_verts,-1);//last(endpoints_verts);
  var minDistance1 = Infinity;
  var minDistance2 = Infinity;
  var minIndex1 = 0;
  var minIndex2 = 0;
  for (var i = 0; i < verts.length/3; i ++) {
    //var x = verts[i];
    //var y = verts[i + 1];
    //var z = verts[i + 2];
    //var distance1 = Math.sqrt(Math.pow(x - vert1.x, 2) + Math.pow(y - vert1.y, 2) + Math.pow(z - vert1.z, 2));
    //var distance2 = Math.sqrt(Math.pow(x - vert2.x, 2) + Math.pow(y - vert2.y, 2) + Math.pow(z - vert2.z, 2));
    var v = vect(verts,i);
    var distance1 = v.distanceTo(vert1);
    var distance2 = v.distanceTo(vert2);
    //console.log('distance1: '+x +', '+y+', '+z);
    //console.log('distance1b: '+v.x +', '+v.y+', '+v.z);
    if (distance1 < minDistance1) {
      minDistance1 = distance1;
      minIndex1 = i;
    }
    if (distance2 < minDistance2) {
      minDistance2 = distance2;
      minIndex2 = i;
    }
  }
  //return [minIndex1, minIndex2, get(verts,minIndex1), get(verts,minIndex2)];
  return {i1:minIndex1, i2:minIndex2, v1:vect(verts,minIndex1), v2:vect(verts,minIndex2)};
}

/* map line onto two endpoints */
export function map(verts, endpoint1, endpoint2) {
  verts = set_density(verts,0.1,0.2);
  var new_verts = [];
  for (var i = 0; i < verts.length-2; i += 3) {
    var ratio = i / (verts.length-3);
    var rts_x = verts[i]-verts[0];
    var rts_y = verts[i+1]-verts[1];
    var rte_x = verts[i]-verts[verts.length-3];
    var rte_y = verts[i+1]-verts[verts.length-2];
    new_verts.push((rts_x+endpoint1.x)*(1-ratio) + (rte_x+endpoint2.x)*ratio);
    new_verts.push((rts_y+endpoint1.y)*(1-ratio) + (rte_y+endpoint2.y)*ratio);
    new_verts.push(1);
    
  }
  return new Float32Array(new_verts);
}

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
  var newVertices2 = [];
  for (var i = 0; i < vertices.length-2; i += 3) {
    if (i == startIndex){
      if(backwards_replacements){
        for (var k = replacements.length-3; k > 0; k -= 3) {
          newVertices2.push(replacements[k]);
          newVertices2.push(replacements[k + 1]);
          newVertices2.push(replacements[k + 2]);
        }
      }else{
        for (var k = 0; k < replacements.length-2; k += 3) {
          newVertices2.push(replacements[k]);
          newVertices2.push(replacements[k + 1]);
          newVertices2.push(replacements[k + 2]);
        }
      }
      i = endIndex;
    }else{
      newVertices2.push(vertices[i]);
      newVertices2.push(vertices[i + 1]);
      newVertices2.push(vertices[i + 2]);
    }
  }
  //newVertices2.push(vertices[vertices.length-3]);
  //newVertices2.push(vertices[vertices.length-2]);
  //newVertices2.push(0);
  return new Float32Array(newVertices2);
}

/* given float32array of 3d vertices and test vertex, return the vertex closest to the test vertex. */
export function closest(verts, test_vertex) {
  //console.log(test_vertex);
  var closestVertex = vect(verts,0);
  var closestDistance = Infinity;
  for (var i = 0; i < verts.length/3; i++) {
    //var distance = Math.sqrt(Math.pow(verts[i] - testVertex.x, 2) + Math.pow(verts[i+1] - testVertex.y, 2) + Math.pow(verts[i+2] - testVertex.z, 2));
    var v = vect(verts,i);
    var distance = v.distanceTo(test_vertex);
    if (distance < closestDistance) {
      //console.log(distance);
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