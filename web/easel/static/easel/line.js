import * as THREE from 'three';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'core/mesh_line.js';

// TODO: unbind event handles when inactive or deleted

function Line(base, draw, parent, source){
    const line = {
        verts: [],
    };

    var active = false;
    const pos = [];
    const mesh_line = new MeshLine();
    const geometry = new THREE.BufferGeometry();
    const material = new MeshLineMaterial({
        color: new THREE.Color('hsl(0,0%,40%)'),
        sizeAttenuation: false,
    });
    const mesh = new THREE.Mesh(mesh_line, material);
    mesh.raycast = MeshLineRaycast;
    parent.group.add(mesh);
    parent.lines.push(line);

    function add_vert(point){
        line.verts.push(point);
        pos.push(point.x);
        pos.push(point.y);
        pos.push(0);
    }

    if(source == null){
        add_vert(draw.point);
        active = true;
        mesh.name = 'line';
    }else{
        mesh.name = source.name;
        const pos = source.geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3 ) {
            line.verts.push(new THREE.Vector2(pos[i], pos[i+1]));
        }
        mesh_line.setGeometry(source.geometry, p=>6); //p=>6 is line width in pixels
    }

    base.viewport.bind('touchmove mousemove', function(event){
        if(active){
            if(!(typeof event.touches === 'undefined')) {
                if(event.touches.length > 1){
                    parent.group.remove(mesh);
                    active = false;
                }
            }
            add_vert(draw.point);
            geometry.setAttribute('position', new THREE.BufferAttribute( new Float32Array(pos), 3 ) );
            mesh_line.setGeometry(geometry, p=>6);
        }
    });

    base.viewport.bind('touchend mouseup', function(event){
        if([0,1].includes(event.which) && active){ // 0 = touch, 1 = left mouse button
            active = false;
        }
    });

    line.fit = function(){
        material.resolution = new THREE.Vector2(base.viewport.outerWidth(),base.viewport.outerHeight());
    }
    line.fit();

    return line;
}export{Line}