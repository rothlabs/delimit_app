import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { Line } from 'easel/line.js';
import * as constraint from 'easel/constraint.js';

function Product(base){
    const product = JSON.parse(document.getElementById('product').innerHTML); // get product meta data from html doc
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

    product.record = function(){
        product.sketch.lines.forEach(line =>{
            line.record();
        });
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
    },function(xhr){},function(error){console.log(error);});

    const exporter = new GLTFExporter();
    product.greenware = function(){
        exporter.parse(product.sketch.group, function ( glb ) {
            const request = new Request('/easel/'+product.id+'/greenware/',{   
                method: 'POST',
                headers: {'X-CSRFToken': base.csrftoken, 'Accept': 'application/octet-stream', 'Content-Type': 'application/octet-stream'},
                mode: 'same-origin',
                body: glb,//JSON.stringify({'action':'next', 'glb':glb})
            });
            fetch(request).then((response) => response.json()).then((data) => {
                console.log(data); 
            });
        },function ( error ) {console.log( 'GLTFExporter Error' );},
        { binary: true});
    };

    product.revert = function(){
        product.sketch.lines.forEach(line =>{
            line.revert();
        });
    }

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


            //console.log(typeof glb);
            //console.log(request.body);

            //const blob =
            //new Blob(
            //    ["This is some important text"],
            //    { type: "text/plain" }
            //);