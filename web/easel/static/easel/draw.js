import * as THREE from 'three';
import { Line } from 'easel/line.js';

function Draw(base, product){
    const draw = {
        point: new THREE.Vector2(),
    };

    const last_mouse_vector = new THREE.Vector2();
    function Pick(event){
        const pick = {
            object: null,
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
        const raycaster = new THREE.Raycaster();
        const vp = new THREE.Vector2();
        vp.x =   ( pick.mouse_vector.x / window.innerWidth ) * 2 - 1;
        vp.y = - ( pick.mouse_vector.y / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera( vp, base.camera );
        const intersects = raycaster.intersectObjects( base.scene.children );
        intersects.forEach(intersect => {
            if(intersect.object == base.plane){
                draw.point = intersect.point;
            }else{
                pick.object = intersect.object;
            }
        });
        return pick;
    }

    var selected_line = null;
    const start_line_threshold = 3;
    var mouse_start = new THREE.Vector2(0,0);
    var new_line_potential = false;
    base.viewport.bind('mousemove touchmove', function(event){
        const pick = Pick(event);
        if(new_line_potential && mouse_start.distanceTo(pick.mouse_vector) >= start_line_threshold){
            const line = Line(base, draw, product.sketch);
            line.set_morph_target(selected_line);
            new_line_potential = false;
        }
    });
    base.viewport.bind('mousedown touchstart', function(event){
        if([0,1].includes(event.which)){ // 0 = touch, 1 = left mouse button
            mouse_start = Pick(event).mouse_vector;
            new_line_potential = true;
        }
    });
    base.viewport.bind('touchend mouseup', function(event){
        if([0,1].includes(event.which)){ // 0 = touch, 1 = left mouse button
            new_line_potential = false;
            const pick = Pick(event);
            if(mouse_start.distanceTo(pick.mouse_vector) < start_line_threshold){
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