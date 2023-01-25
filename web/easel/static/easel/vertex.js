/* with float32array of 3D vertices representing a line, add vertices so there is never too big of a distance between consecutive vertices */
function enforce_max_distance(vertices, maxDistance) {
  var newVertices = [];//[vertices[0],vertices[1],vertices[2]];
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
        newVertices.push(x1 + xIncrement * j);
        newVertices.push(y1 + yIncrement * j);
        newVertices.push(z1 + zIncrement * j);
      }
    }
    newVertices.push(x2);
    newVertices.push(y2);
    newVertices.push(z2);
  }
  return new Float32Array(newVertices);
}

function enforce_distance_range(vertices, minDistance, maxDistance) {
  /* Considering a Float32Array of 3D vertices representing line, write a function to remove vertices so that they are never too close. */
  vertices = Array.from(vertices);
  var i = 0;
  while (i < vertices.length) {
    var j = i + 3;
    while (j < vertices.length) {
      var dx = vertices[i] - vertices[j];
      var dy = vertices[i + 1] - vertices[j + 1];
      var dz = vertices[i + 2] - vertices[j + 2];
      var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (distance < minDistance) {
          vertices.splice(j, 3);
      } else {
          j += 3;
      }
    }
    i += 3;
  }
  return enforce_max_distance(vertices, maxDistance);
}

/* given an array, return first 3 elements as new array */
function first(array) {
  return array.slice(0, 3);
}

/* given an array, return last 3 elements as new array */
function last(array) {
  return array.slice(array.length - 3, array.length);
}

/* given float32array 3d vertices and two test vertices, return the closet vertex for each test vertex. */
function closet_indices_to_endpoints(vertices, line_verts) {
  const vert1 = first(line_verts);
  const vert2 = last(line_verts);
  var minDistance1 = Infinity;
  var minDistance2 = Infinity;
  var minIndex1 = 0;
  var minIndex2 = 0;
  for (var i = 0; i < vertices.length; i += 3) {
    var x = vertices[i];
    var y = vertices[i + 1];
    var z = vertices[i + 2];
    var distance1 = Math.sqrt(Math.pow(x - vert1[0], 2) + Math.pow(y - vert1[1], 2) + Math.pow(z - vert1[2], 2));
    var distance2 = Math.sqrt(Math.pow(x - vert2[0], 2) + Math.pow(y - vert2[1], 2) + Math.pow(z - vert2[2], 2));
    if (distance1 < minDistance1) {
      minDistance1 = distance1;
      minIndex1 = i;
    }
    if (distance2 < minDistance2) {
      minDistance2 = distance2;
      minIndex2 = i;
    }
  }
  return [minIndex1, minIndex2];
}

export{enforce_distance_range, closet_indices_to_endpoints}