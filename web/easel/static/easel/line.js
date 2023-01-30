import * as THREE from 'three';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'core/mesh_line.js';
import * as vtx from 'easel/vertex.js';

function Line(base, draw, parent, source){
    const line = {
        verts: [],
        mesh: null,
        endpoints: null,
        material: new MeshLineMaterial({color: new THREE.Color('hsl(0,0%,40%)')}),
        morph_target: null,
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
    line.endpoints = new THREE.Points( ep_geometry, ep_material );
    parent.group.add(line.endpoints);

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
    }

    const constraints = [];
    line.update = function(args){
        if(args.rules){
            line.verts = vtx.set_density(line.verts,1,2);
        }
        if(args.constrain > 0){
            constraints.forEach(constraint =>{
                constraint.enforce(args.constrain);
            });
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(line.verts,3));
        geometry.computeBoundingSphere();
        mesh_line.setGeometry(geometry);//, p=>1);
        ep_geometry.setAttribute('position', new THREE.Float32BufferAttribute(vtx.endpoints(line.verts,1),3));
        ep_geometry.computeBoundingSphere();
        if(args.record){
            parent.product.record();
        }
    }

    const history = [];
    var history_index = 0;
    line.record = function(){
        history.splice(history_index);
        history.push(line.verts);
        if(history.length > 7){
            history.shift();
        }
        history_index = history.length;
    };
    line.undo = function(){
        if(history_index-1 > 0){
            history_index--;
            line.verts = history[history_index-1];
            line.update({});
        }
    };
    line.redo = function(){
        if(history_index+1 <= history.length){
            history_index++;
            line.verts = history[history_index-1];
            line.update({});
        }
    };
    line.last_record = function(){
        return history[history_index-1];
    }

    var active = false;
    if(source == null){
        add_vert(draw.point);
        active = true;
        line.mesh.name = 'line';
        line.endpoints.visible = false;
    }else{
        line.mesh.name = source.name;
        line.verts = source.geometry.attributes.position.array;
        line.update({rules: true});
    }

    line.delete = function(){
        base.viewport.off('touchmove mousemove', touchmove_mousemove);
        base.viewport.off('touchend mouseup', touchend_mouseup);
        parent.group.remove(line.mesh);
        parent.group.remove(line.endpoints);
        parent.lines.splice(parent.lines.indexOf(line), 1);
    }

    function touchmove_mousemove(event){
        if(active){
            if(!(typeof event.touches === 'undefined')) { 
                if(event.touches.length > 1){ // cancel line if more than one touch point 
                    line.delete();
                }
            }
            add_vert(draw.point);
            line.update({});
        }else{
            if(!(typeof event.touches === 'undefined')) { 
                if(event.touches.length > 1){ // cancel drag if more than one touch point 
                    selected_endpoint = null;
                }
            }
            if(selected_endpoint == 0){
                line.verts = vtx.map(line.last_record(), draw.point, vtx.vect(line.last_record(),-1)); //[draw.point.x,draw.point.y,0]
                line.update({rules: true, constrain: 2});
            }else if(selected_endpoint == 1){
                line.verts = vtx.map(line.last_record(), vtx.vect(line.last_record(),0), draw.point); //vtx.first(line.last_record())
                line.update({rules: true, constrain: 2});
            }
        }
    }base.viewport.on('touchmove mousemove', touchmove_mousemove);

    function touchend_mouseup(event){
        if(active && [0,1].includes(event.which)){ // 0 = touch, 1 = left mouse button
            active = false;
            if(line.morph_target != null){
                line.morph_target.morph(line);
            }
        }
        if(selected_endpoint != null){
            selected_endpoint = null;
            line.update({rules: true, constrain: 2, record:true});
        }
    }base.viewport.on('touchend mouseup', touchend_mouseup);

    line.morph = function(morpher){
        const closest = vtx.closest_to_endpoints(line.verts, morpher.verts);
        const new_verts = vtx.map(morpher.verts, closest.v1, closest.v2);
        line.verts = vtx.replace(line.verts, closest.i1, closest.i2, new_verts);
        line.update({rules: true, constrain:true, record:true});
        morpher.delete();
    };

    line.add_constraint = function(constraint){
        constraints.push(constraint);
    };

    line.select = function(){
        line.material.color = new THREE.Color('hsl(200, 100%, 50%)');
    };
    line.deselect = function(){
        line.material.color = new THREE.Color('hsl(0,0%,40%)');
    };
    var selected_endpoint = null;
    line.select_endpoint = function(index){
        selected_endpoint = index;
    };

    line.fit = function(){
        line.material.lineWidth = 4 / base.camera.zoom;
    };line.fit();

    return line;
}export{Line}

// needed of size sizeAttenuation is false for line material:
//line.material.resolution = new THREE.Vector2(base.viewport.outerWidth()*1.5,base.viewport.outerHeight()*1.5);