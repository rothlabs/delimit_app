import {createElement as r, useState} from 'react';
import {pack_rv} from '../studio.js';
import {Part} from './part.js';
import {makeVar, useReactiveVar} from 'apollo';

export function Graph(){
    const pack = useReactiveVar(pack_rv);
    return (
        r('group', {name:'graph'}, // ref:graph, dispose:null
			...pack.p.map((part, i)=> 
				r(Part, {part:part})//{ref:rf=>sketches.current[i]=rf, source:node}) 
			),
		)
    )
}

