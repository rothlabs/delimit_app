import {get_draft} from 'delimit/graph';

export const set_queries = ({draft=get_draft(), queries}) => {
    console.log('set_queries!!!', queries);
};