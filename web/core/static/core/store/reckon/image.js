import {current} from 'immer';
import {Vector3, CanvasTexture, sRGBEncoding} from 'three';
import { rs } from '../../app.js';

const v1 = new Vector3();

export const image = {
    props: 'width height data', // rename data to data_url #1
    node(d, n, c, ax, a={}){ 
        try{
            if(c.texture && c.canvas.width == c.width && c.canvas.height == c.height){
                c.texture.needsUpdate = true;
            }else{
                if(c.data != undefined){
                    var img = new Image();
                    img.onload = function(){
                        rs(d=>{
                            d.n[n].c.canvas = document.createElement("canvas");
                            d.n[n].c.canvas.width = d.n[n].c.width;
                            d.n[n].c.canvas.height = d.n[n].c.height;
                            d.n[n].c.canvas.getContext("2d").drawImage(img, 0, 0, d.n[n].c.width, d.n[n].c.height);
                            var texture = new CanvasTexture(d.n[n].c.canvas);
                            texture.encoding = sRGBEncoding;
                            d.n[n].c.texture = texture;
                        });
                    }
                    img.src = c.data; 
                }
            }
            //console.log('reckon image');
        }catch(e){
            console.log('IMAGE ERROR', e);
        }
    },
};


// var img = new Image();
// img.onload = function(){
//     var map = new CanvasTexture(img);
//     map.encoding = sRGBEncoding;
//     rs(d=>{
//         d.n[n].c.map = map;
//         if(!d.n[n].c.canvas){
//             d.n[n].c.canvas = document.createElement("canvas");
//             d.n[n].c.canvas.width = d.n[n].c.width;
//             d.n[n].c.canvas.height = d.n[n].c.height;
//             d.n[n].c.canvas.getContext("2d").drawImage(img, 0, 0, d.n[n].c.width, d.n[n].c.height);
//         }
//     });
// }
// img.src = c.data; //canvas.toDataURL();


// var image = new Image();
// image.src = this.canvas.toDataURL();
// image.onload = function()
// {
//     var texture = new THREE.Texture(image);
//     texture.encoding = THREE.sRGBEncoding;
//     material.map = texture;
//     texture.needsUpdate = true;
// }
