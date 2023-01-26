import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Line } from 'easel/line.js';
import { Endpoint_Constraint } from 'easel/endpoint_constraint.js';

function Product(base){
    const product = JSON.parse($('#product').text()); // get product meta data from html doc
    product.sketch = {
        lines: [],
        bounds: new THREE.Box3(),
        group: new THREE.Group(),
    };
    product.sketch.group.name = 'sketch';
    product.fit = function(){
        product.sketch.lines.forEach(line => {line.fit();});
    };
    const loader = new GLTFLoader();
    loader.load(product.url, function ( data ) {
        data.scene.children.forEach(source => {
            Line(base, product.draw, product.sketch, source);
        });
        product.sketch.lines.forEach(line_a => {
            product.sketch.lines.forEach(line_b => {
                Endpoint_Constraint(line_a, line_b);
            });
        });
        product.sketch.bounds.setFromObject( product.sketch.group );
        base.scene.add(product.sketch.group);
        base.fit(product);
    });

    return product;
}export{Product}


