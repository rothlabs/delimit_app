import * as THREE from 'three';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'core/mesh_line.js';

function Line(base, draw, parent, source){
    const line = {
        verts: [],
        start: new THREE.Vector2(0,0),
        end: new THREE.Vector2(0,0),
        mesh: null,
        material: new MeshLineMaterial({color: new THREE.Color('hsl(0,0%,40%)')}),
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
    }else{
        line.mesh.name = source.name;
        line.verts = source.geometry.attributes.position.array;
        mesh_line.setGeometry(source.geometry);//, p=>1); //p=>4 is line width in pixels
        line.start.x = line.verts[0]; 
        line.start.y = line.verts[1];
        line.end.x = line.verts[line.verts.length-3]; 
        line.end.y = line.verts[line.verts.length-2];
    }
    ep_geometry.setAttribute('position', new THREE.Float32BufferAttribute([line.start.x,line.start.y,1, line.end.x,line.end.y,1],3));
    ep_geometry.computeBoundingSphere();

    function delete_line(event){
        active = false;
        parent.group.remove(line.mesh);
        parent.group.remove(ep_points);
        base.viewport.unbind(event);
    }

    base.viewport.bind('touchmove mousemove', function(event){
        if(active){
            if(!(typeof event.touches === 'undefined')) { 
                if(event.touches.length > 1){ // cancel line if more than one touch point 
                    delete_line(event);
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
            //if(line.start.distanceTo(line.end) < min_length){
            //    delete_line(event);
            //}
        }
    });

    line.fit = function(){
        line.material.lineWidth = 4 / base.camera.zoom;
    }
    line.fit();

    const constraints = [];
    line.add_constraint = function(constraint){
        constraints.push(constraint);
    }

    line.select = function(){
        line.material.color = new THREE.Color('hsl(200, 100%, 50%)');
    }
    line.deselect = function(){
        line.material.color = new THREE.Color('hsl(0,0%,40%)');
    }

    return line;
}export{Line}

// needed of size sizeAttenuation is false for line material:
//line.material.resolution = new THREE.Vector2(base.viewport.outerWidth()*1.5,base.viewport.outerHeight()*1.5);