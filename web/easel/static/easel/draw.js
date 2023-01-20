import * as THREE from 'three';
import { Line } from 'easel/line.js';

function Draw(base, product){
    const draw = {
        point: new THREE.Vector2()
    };
    function viewport_point(source){
        if(!(typeof source.touches === 'undefined')) {
            source = source.touches[0];
        }
        const raycaster = new THREE.Raycaster();
        const vp = new THREE.Vector2();
        vp.x =   ( source.clientX / window.innerWidth ) * 2 - 1;
        vp.y = - ( source.clientY / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera( vp, base.camera );
        const intersects = raycaster.intersectObjects( base.scene.children );
        intersects.forEach(intersect => {
            if(intersect.object == base.plane){
                draw.point = intersect.point;
            }
        });
    }
    base.viewport.bind('mousemove touchmove', function(event){
        viewport_point(event);
    });
    base.viewport.bind('mousedown touchstart', function(event){
        if([0,1].includes(event.which)){ // 0 = touch, 1 = left mouse button
            viewport_point(event);
            Line(base, draw, product.sketch);
        }
    });
    return draw;
}export{Draw}