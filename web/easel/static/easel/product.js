import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Line } from 'easel/line.js';
import * as constraint from 'easel/constraint.js';

function Product(base){
    const product = JSON.parse($('#product').text()); // get product meta data from html doc
    product.sketch = {
        lines: [],
        bounds: new THREE.Box3(),
        group: new THREE.Group(),
        product: product,
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
        product.sketch.lines.forEach(line1 => {
            product.sketch.lines.forEach(line2 => {
                constraint.Coincident(line1, line2);
            });
        });
        product.record();
        product.sketch.bounds.setFromObject( product.sketch.group );
        base.scene.add(product.sketch.group);
        base.fit(product);
    });

    product.record = function(){
        product.sketch.lines.forEach(line =>{
            line.record();
        });
    };

    product.undo = function(){
        product.sketch.lines.forEach(line =>{
            line.undo();
        });
    };

    product.redo = function(){
        product.sketch.lines.forEach(line =>{
            line.redo();
        });
    };

    return product;
}export{Product}


