import {create} from 'zustand';
import {subscribeWithSelector} from 'zmiddle';
import {shallow} from 'shallow';
import { create_base_slice } from './base.js';
import { create_graph_slice } from './graph.js';

export const useD = create(
    subscribeWithSelector((...a) => ({ 
        ...create_base_slice(...a),
        ...create_graph_slice(...a),
    }))
);
export const useDS = (selector)=> useD(selector, shallow);