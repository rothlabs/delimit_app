import {current} from 'immer';
import {Vector3, CanvasTexture, sRGBEncoding} from 'three';
import { rs } from '../../app.js';

const v1 = new Vector3();

const curve_div = 2;
const gradient_res = 10;

export const image = {
    props: ['width', 'height', 'data', 'order'], // rename data to data_url #1
    node(d, n, c, ax, a={}){ 
        try{if(!(a.cause && a.cause[0]=='casted_matrix')){
            if(c.canvas && c.canvas.width == c.width && c.canvas.height == c.height && c.canvas.toDataURL()==c.data){
                c.texture.needsUpdate = true;
                if(!d.design.act && d.n[n].n.stroke){// && !(a.cause && a.cause[0].includes(d.n[n].n.data[0]))){
                    var cctx = c.canvas.getContext('2d');
                    cctx.fillStyle = 'white';
                    cctx.fillRect(0, 0, c.width, c.height);
                    d.n[n].n.stroke.forEach(sn => {
                        var bn = d.n[sn].n.brush[0];
                        d.n[sn].n.curve.forEach(cn=>{
                            var curve = d.n[cn].c.curve;
                            var pts = curve.getSpacedPoints(Math.round(curve.getLength()/curve_div));
                            cctx.beginPath();
                            pts.forEach((p,i)=>{
                                var x = Math.round(( p.x + d.easel_size/2) / d.easel_size * c.width);
                                var y = Math.round((-p.y + d.easel_size/2) / d.easel_size * c.height);
                                if(i==0) cctx.moveTo(x, y);
                                else cctx.lineTo(x, y);
                                //const grd = cctx.createRadialGradient(x, y, d.n[bn].c.radius_a, x, y, d.n[bn].c.radius_b);
                                //grd.addColorStop(0, d.n[bn].c.color_a);
                                //grd.addColorStop(1, d.n[bn].c.color_b);
                                //cctx.fillStyle = grd;
                                //cctx.fillRect(x-d.n[bn].c.radius_b, y-d.n[bn].c.radius_b, d.n[bn].c.radius_b*2, d.n[bn].c.radius_b*2);
                            });
                            cctx.lineWidth = d.n[bn].c.radius_b;
                            cctx.strokeStyle = d.n[bn].c.color_b;
                            cctx.stroke();
                            // for(let i=0; i<gradient_res; i++){
                            //     cctx.lineWidth = c.radius_a 
                            // }
                        });
                    });
                    d.n[d.n[n].n.data[0]].v = d.n[n].c.canvas.toDataURL();
                    //d.node.set(d, n, {data:d.n[n].c.canvas.toDataURL()}, 'stroke');
                }
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
                            d.reckon.up(d,n);
                        });
                    }
                    img.src = c.data; 
                }
            }
            console.log('reckon image');
        }}catch(e){
            console.log('IMAGE ERROR', e);
        }
    },
};



// var pts = curve.getSpacedPoints(Math.round(curve.getLength()/stroke_div));
// pts.forEach(p=>{
//     var x = Math.round(( p.x + d.easel_size/2) / d.easel_size * c.width);
//     var y = Math.round((-p.y + d.easel_size/2) / d.easel_size * c.height);
//     const grd = cctx.createRadialGradient(x, y, d.n[bn].c.radius_a, x, y, d.n[bn].c.radius_b);
//     grd.addColorStop(0, d.n[bn].c.color_a);
//     grd.addColorStop(1, d.n[bn].c.color_b);
//     cctx.fillStyle = grd;
//     cctx.fillRect(x-d.n[bn].c.radius_b, y-d.n[bn].c.radius_b, d.n[bn].c.radius_b*2, d.n[bn].c.radius_b*2);
// });



                            //d.node.for_n(d, n, (r,n)=>{
                            //    d.next('reckon.up', n);//d.reckon.up(d, n);
                                //console.log('reckup other nodes!');
                            //});


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
