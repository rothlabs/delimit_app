import {current} from 'immer';
import {Vector3, CanvasTexture, sRGBEncoding} from 'three';
import { rs } from '../../app.js';

const v1 = new Vector3();

export const image = {
    props: 'width height image_code', // rename image_code to data_url #1
    node(d, n, c, ax, a={}){ 
        try{
            var img = new Image();
            img.onload = function(){
                var map = new CanvasTexture(img);
                map.encoding = sRGBEncoding;
                rs(d=>{
                    d.n[n].c.map = map;
                });
            }
            img.src = c.image_code; //canvas.toDataURL();
            console.log('reckon image');
        }catch(e){
            console.log('IMAGE ERROR', e);
        }
    },
};


// var image = new Image();
// image.src = this.canvas.toDataURL();
// image.onload = function()
// {
//     var texture = new THREE.Texture(image);
//     texture.encoding = THREE.sRGBEncoding;
//     material.map = texture;
//     texture.needsUpdate = true;
// }
