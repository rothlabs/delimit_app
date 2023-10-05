import {current} from 'immer';
import {Vector3, CanvasTexture, sRGBEncoding} from 'three';
import { rs } from '../../app.js';

const v1 = new Vector3();

export const brush = {
    props: ['color_a', 'color_b', 'radius_a', 'radius_b'], // rename data to data_url #1
    node(d, n, c, ax, a={}){ 
        try{
            
        }catch(e){
            console.log('BRUSH ERROR', e);
        }
    },
};

