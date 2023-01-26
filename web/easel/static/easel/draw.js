import * as THREE from 'three';
import { Line } from 'easel/line.js';

function Draw(base, product){
    const draw = {
        point: new THREE.Vector2(0,0),
    };

    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 10;
    const raycast_vector = new THREE.Vector2();
    const last_mouse_vector = new THREE.Vector2();
    function Pick(event){
        const pick = {
            object: null,
            index: null,
            mouse_vector: new THREE.Vector2(0,0),
        };
        if(!(typeof event.touches === 'undefined')) {
            event = event.touches[0];
        }
        if(typeof event === 'undefined'){
            pick.mouse_vector.set(last_mouse_vector.x,last_mouse_vector.y);
        }else{
            pick.mouse_vector.set(event.clientX,event.clientY);
        }
        last_mouse_vector.set(pick.mouse_vector.x, pick.mouse_vector.y);
        raycast_vector.x =   ( pick.mouse_vector.x / window.innerWidth ) * 2 - 1;
        raycast_vector.y = - ( pick.mouse_vector.y / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera( raycast_vector, base.camera );
        const intersects = raycaster.intersectObjects( base.scene.children );
        var z = -1000;
        intersects.forEach(intersect => {
            if(intersect.object == base.plane){
                draw.point = intersect.point;
            }else{
                if(intersect.object.position.z > z){
                    pick.object = intersect.object;
                    pick.index = intersect.index;
                    z = intersect.object.position.z;
                }
            }
        });
        return pick;
    }

    var selected_line = null;
    const drag_threshold = 3;
    var mouse_start = new THREE.Vector2(0,0);
    var new_line_potential = false;
    base.viewport.on('mousemove touchmove', function(event){
        const pick = Pick(event);
        if(new_line_potential && mouse_start.distanceTo(pick.mouse_vector) >= drag_threshold){
            const line = Line(base, draw, product.sketch);
            line.morph_target = selected_line;//.set_morph_target(selected_line);
            new_line_potential = false;
        }
    });
    base.viewport.on('mousedown touchstart', function(event){
        if([0,1].includes(event.which)){ // 0 = touch, 1 = left mouse button
            const pick = Pick(event)
            mouse_start = pick.mouse_vector;
            if(selected_line == null){
                product.sketch.lines.forEach(line => {
                    if(pick.object == line.endpoints){
                        line.select_endpoint(pick.index);
                    }
                });
            }else{
                new_line_potential = true;
            }
        }
    });
    base.viewport.on('touchend mouseup', function(event){
        if([0,1].includes(event.which)){ // 0 = touch, 1 = left mouse button
            new_line_potential = false;
            const pick = Pick(event);
            if(mouse_start.distanceTo(pick.mouse_vector) < drag_threshold){
                selected_line = null;
                product.sketch.lines.forEach(line => {
                    line.deselect();
                    if(pick.object == line.mesh){
                        line.select();
                        selected_line = line;
                    }
                });
            }
        }
    });

    return draw;
}export{Draw}