import * as THREE from 'three';

function Draw(base){
    const draw = {
        ray: new THREE.Raycaster(),
        mouse_point: new THREE.Vector2(),
        point: new THREE.Vector2(),
        update(base, draw, product){
            draw.ray.setFromCamera( draw.mouse_point, base.camera );
            const intersects = draw.ray.intersectObjects( base.scene.children );
            intersects.forEach(intersect => {
                if(intersect.object == base.plane){
                    draw.point = intersect.point;
                }
            });
            //for (let i = 0; i < intersects.length; i ++) {
                //intersects[i].object.material.color.set(0xff0000);
            //    if(intersects[i].object == base.plane){
                    //console.log('plane hit!');
                    //console.log(intersects[i].point);
            //    }
            //}
        }
    };
    //const raycaster = new THREE.Raycaster();
    //const pointer = new THREE.Vector2();
    //window.addEventListener('pointermove', function(event){
    base.viewport.mousemove(function(event){
        draw.mouse_point.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        draw.mouse_point.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    });
    base.viewport.mousedown(function(event){
        if(event.which == 1){
            console.log(draw.point);
        }
    });
    base.viewport.mouseup(function(event){

    });
    return draw;
}

export{Draw}