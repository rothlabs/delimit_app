import * as THREE from 'three';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'core/mesh_line.js';
import * as vertex from 'easel/vertex.js';

function Line(base, draw, parent, source){
    const line = {
        verts: [],
        start: new THREE.Vector2(0,0),
        end: new THREE.Vector2(0,0),
        mesh: null,
        material: new MeshLineMaterial({color: new THREE.Color('hsl(0,0%,40%)')}),
        weight: 1,
    };

    // mesh line
    const mesh_line = new MeshLine();
    const geometry = new THREE.BufferGeometry();
    line.mesh = new THREE.Mesh(mesh_line, line.material);
    line.mesh.raycast = MeshLineRaycast;
    parent.group.add(line.mesh);
    parent.lines.push(line);

    // endpoints
    const ep_geometry = new THREE.BufferGeometry();
    const ep_material = new THREE.PointsMaterial( { color:'hsl(0,0%,40%)', size:10 } );
    const ep_points = new THREE.Points( ep_geometry, ep_material );
    parent.group.add(ep_points);

    var vert_count = -1;
    function add_vert(point){
        if(vert_count > 3){
            var total_x = 0.0;
            var total_y = 0.0;
            for(var i=0; i<vert_count; i++){
                line.verts.pop();
                total_y += line.verts.pop();
               total_x += line.verts.pop();
           }
           line.verts.push(total_x / vert_count);
           line.verts.push(total_y / vert_count);
           line.verts.push(0);
           vert_count = 0;
        }

        line.verts.push(point.x);
        line.verts.push(point.y);
        line.verts.push(0);
        vert_count++;

        line.end.x = line.verts[line.verts.length-3]; 
        line.end.y = line.verts[line.verts.length-2];
        ep_geometry.setAttribute('position', new THREE.Float32BufferAttribute([line.start.x,line.start.y,1, line.end.x,line.end.y,1],3));
        ep_geometry.computeBoundingSphere();
    }

    var active = false;
    if(source == null){
        add_vert(draw.point);
        active = true;
        line.mesh.name = 'line';
        line.start.x = draw.point.x; 
        line.start.y = draw.point.y; 
        ep_points.visible = false;
    }else{
        line.mesh.name = source.name;
        line.verts = source.geometry.attributes.position.array;
        line.verts = vertex.enforce_distance_range(line.verts,1,2);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(line.verts,3));
        geometry.computeBoundingSphere();
        mesh_line.setGeometry(geometry);//, p=>1);
        //mesh_line.setGeometry(source.geometry);//, p=>1); //p=>4 is line width in pixels
        line.start.x = line.verts[0]; 
        line.start.y = line.verts[1];
        line.end.x = line.verts[line.verts.length-3]; 
        line.end.y = line.verts[line.verts.length-2];
    }
    ep_geometry.setAttribute('position', new THREE.Float32BufferAttribute([line.start.x,line.start.y,1, line.end.x,line.end.y,1],3));
    ep_geometry.computeBoundingSphere();

    line.delete = function(){
        parent.group.remove(line.mesh);
        parent.group.remove(ep_points);
        parent.lines.splice(parent.lines.indexOf(line), 1);
    }

    base.viewport.bind('touchmove mousemove', function(event){
        if(active){
            if(!(typeof event.touches === 'undefined')) { 
                if(event.touches.length > 1){ // cancel line if more than one touch point 
                    active = false;
                    base.viewport.unbind(event);
                    line.delete();
                }
            }
            add_vert(draw.point);
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(line.verts,3));
            geometry.computeBoundingSphere();
            mesh_line.setGeometry(geometry);//, p=>1);
        }else{
            base.viewport.unbind(event);
        }
    });
    //const min_length = 1;
    base.viewport.bind('touchend mouseup', function(event){
        if([0,1].includes(event.which) && active){ // 0 = touch, 1 = left mouse button
            active = false;
            base.viewport.unbind(event);
            line.verts = vertex.enforce_distance_range(line.verts,1,2);
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(line.verts,3));
            mesh_line.setGeometry(geometry);
            if(morph_target != null){
                morph_target.morph(line);
            }
            //if(line.start.distanceTo(line.end) < min_length){
            //    delete_line(event);
            //}
        }
    });

    //var morphers = [];
    line.morph = function(morpher){
        //morphers.push(morpher);

        const stitch_vert_info = vertex.closet_to_endpoints(line.verts, morpher.verts)

        const new_verts = vertex.map(morpher.verts, stitch_vert_info[2], stitch_vert_info[3]);
        
        
        line.verts = vertex.replace(line.verts, stitch_vert_info[0], stitch_vert_info[1], new_verts);
        

        //const first_verts = line.verts.slice(0,stitch_indices[0]);
        //const middle_verts = vertex.map_verts(morpher.verts, line.verts[stitch_indices[0]], line.verts[stitch_indices[1]]);
        //const last_verts = line.verts.slice(stitch_indices[1],);

        //morpher.geometry.setAttribute('position', new THREE.Float32BufferAttribute(morpher.verts,3));
        //morpher.geometry.computeBoundingSphere();
        //morpher.mesh_line.setGeometry(morpher.geometry);

        // for(var i=3; i<line.verts.length-3; i+=3){
        //     var line_vert = new THREE.Vector2(line.verts[i],line.verts[i+1]); 
        //     var moved = new THREE.Vector2(line.verts[i],line.verts[i+1]); 
        //     //morphers.forEach(morpher => {
        //         for(var k=0; k<morpher.verts.length; k+=3){
        //             const morpher_vert = new THREE.Vector2(morpher.verts[k], morpher.verts[k+1]);
        //             const dist = line_vert.distanceTo(morpher_vert);
        //             //const vw = 1 - Math.abs(k - morpher.verts.length / 2) / (morpher.verts.length / 2);
        //             //total_dist += dist;
        //             moved = moved.add(morpher_vert.sub(line_vert).multiplyScalar(morpher.weight / ((1+dist)*(1+dist)) ));
                    
        //             //line_vert = line_vert.add(
        //             //    morpher_vert.sub(line_vert).multiplyScalar(morpher.weight / ((1+dist*2)*(1+dist*2)) ) //.normalize()
        //             //);
        //         }
        //         //console.log(move.length());
        //     //});
        //     if(line_vert.sub(moved).length() > 1){
        //         line.verts[i]   = moved.x;
        //         line.verts[i+1] = moved.y;
        //         //line_vert = moved;//line_vert.add(move);
        //     }
        //     //line.verts[i]   = line_vert.x;
        //     //line.verts[i+1] = line_vert.y;
        // }

        line.verts = vertex.enforce_distance_range(line.verts,1,2);


        geometry.setAttribute('position', new THREE.Float32BufferAttribute(line.verts,3));

        geometry.computeBoundingSphere();
        mesh_line.setGeometry(geometry);//, p=>1);

        //morphers.forEach(morpher => {
        //    morpher.weight -= 0.2;
           // morpher.material.opacity = 0.2;
        //    if(morpher.weight<0){
        //        morphers.splice(morphers.indexOf(morpher), 1);
                morpher.delete();
        //    }
        //});
    }

    var morph_target = null;
    line.set_morph_target = function(t){
        morph_target = t;
    }

    const constraints = [];
    line.add_constraint = function(constraint){
        constraints.push(constraint);
    }

    line.select = function(){
        //line.selected = true;
        line.material.color = new THREE.Color('hsl(200, 100%, 50%)');
    }
    line.deselect = function(){
        //line.selected = false;
        line.material.color = new THREE.Color('hsl(0,0%,40%)');
    }

    line.fit = function(){
        line.material.lineWidth = 4 / base.camera.zoom;
    }
    line.fit();

    return line;
}export{Line}

// needed of size sizeAttenuation is false for line material:
//line.material.resolution = new THREE.Vector2(base.viewport.outerWidth()*1.5,base.viewport.outerHeight()*1.5);