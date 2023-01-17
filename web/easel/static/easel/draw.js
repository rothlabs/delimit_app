import * as THREE from 'three';
import { Line } from 'easel/line.js';

function Draw(base, product){
    const raycaster = new THREE.Raycaster();
    const viewport_point = new THREE.Vector2();
    const draw = {
        point: new THREE.Vector2()
    };
    draw.update = function(){
        raycaster.setFromCamera( viewport_point, base.camera );
        const intersects = raycaster.intersectObjects( base.scene.children );
        intersects.forEach(intersect => {
            if(intersect.object == base.plane){
                draw.point = intersect.point;
            }
        });
    }
    base.viewport.mousemove(function(event){
        viewport_point.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        viewport_point.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    });
    base.viewport.mousedown(function(event){
        if(event.which == 1){
            Line(base, draw, product.sketch);
        }
    });
    return draw;
}export{Draw}