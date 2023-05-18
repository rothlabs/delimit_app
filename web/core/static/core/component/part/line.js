import {createElement as c, useEffect, useState} from 'react';
import {ss, ssp, useS, useSS} from '../../app.js';
import {useFrame, useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {Points, Point} from '@react-three/drei/Points';

export function Line({n}){
    //console.log('render line')
    return(
        c('group', {name:'line'},
            c(Dots),
        )
    )
}

function Dots(){
    //const nodes = useSS(d=> d.graph.nodes);  
    console.log('render line dots');
    return (
        c(Points, {limit:1000, range:1000}, 
            c('pointsMaterial', {size:15, vertexColors:[[.5,.5,.5],]}),
            c(Point, {position:[0,0,10], color:'red'}),
		)
    )
}