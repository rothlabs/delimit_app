import {current} from 'immer';
import {Vector3} from 'three';

const v1 = new Vector3();

export const image = {
    props: 'width height image_code',
    node(d, n, c, ax, a={}){ 
        try{

            
        }catch(e){
            console.log('IMAGE ERROR', e);
        }
    },
};
