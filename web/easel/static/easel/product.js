import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'core/mesh_line.js';

function Product(base){
    const product = JSON.parse($('#product').text());
    product.sketch = {
        lines: [],
        bounds: new THREE.Box3(),
    }
    const sketch = new THREE.Group();
    const loader = new GLTFLoader();
    loader.load(product['url'], function ( data ) {
        data.scene.children.forEach(obj => {
            //const geometry = new THREE.BufferGeometry();
            //const filtered_pos = new Array();
            const vertices = new Array();
            const pos = obj.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 3 ) {
                //if(pos[i+2] < 1){
                //    filtered_pos.push(pos[i]);
                //    filtered_pos.push(pos[i+1]);
                //    filtered_pos.push(pos[i+2]);
                vertices.push(new THREE.Vector2(pos[i], pos[i+1]));
                //}
            }
            const line = new MeshLine();
            //geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(filtered_pos), 3 ) );
            line.setGeometry(obj.geometry, p=>6); //p=>6 is line width    obj.geometry
            const line_material = new MeshLineMaterial({
                color: new THREE.Color('hsl(0,0%,40%)'),
                sizeAttenuation: false,
            });
            product.sketch.lines.push({vertices:vertices, material:line_material});
            const mesh = new THREE.Mesh(line, line_material);
            mesh.raycast = MeshLineRaycast;
            sketch.add(mesh);
        });
        product.sketch.bounds.setFromObject( sketch );
        base.scene.add(sketch);
        base.fit_viewport(base, product);
        console.log(product);
    });
    return product;
}

export{Product}


