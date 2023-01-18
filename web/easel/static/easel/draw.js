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
    base.viewport.bind('touchmove mousemove', function(event){
        //console.log('touchmove!');
        viewport_point.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        viewport_point.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    });
    base.viewport.bind('touchmove', function(event){
        //console.log('touchmove!');
        viewport_point.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
        viewport_point.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;
    });
    base.viewport.bind('mousedown', function(event){
        //console.log('touchstart!');
        if(event.which == 1){
            //draw.point = null;
            //console.log('touchstart!');
            viewport_point.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            viewport_point.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            draw.update();
            Line(base, draw, product.sketch);
        }
    });
    base.viewport.bind('touchstart', function(event){
        //console.log('touchstart!');
        if(event.touches.length < 2){
            //draw.point = null;
            //console.log('touchstart!');
            viewport_point.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
            viewport_point.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;
            draw.update();
            Line(base, draw, product.sketch);
        }
    });
    return draw;
}export{Draw}