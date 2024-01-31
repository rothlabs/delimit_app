import {createElement as c, useState} from 'react';
import {animated, useTransition} from '@react-spring/web';
import {
    set_store, gql_mutations, render_badge_token, 
    use_mutation, readable
} from 'delimit';

const mutations = gql_mutations.map(gql => gql[0]); 

export function Server_Mutations(){
    return mutations.map(gql_name => c(Mutation, {gql_name, key:gql_name}));
}

const repo_fetch_triggers = ['make_repo', 'make_meta_repo', 'edit_repo', 'drop_repo', 'edit_version', 'drop_versions'];

function Mutation({gql_name}){
    const [failed, set_failed] = useState()
    const [mutate, {loading, error}] = use_mutation(gql_name, {
        onCompleted: data => {
            for(const obj of Object.values(data)){
                if(obj.error) set_failed(gql_name+', '+obj.error)
            }
            update_from_mutation_response({gql_name, data}) 
        },
        refetchQueries: (repo_fetch_triggers.includes(gql_name)) ? ['GetRepos'] : undefined,
    }); 
    set_store(d => d.server[gql_name] = mutate);
    let open = true;
    let icon = 'bi-check-lg';
    let name = 'Done';
    if(loading){
        icon = 'bi-hourglass-split';
        name = readable(gql_name);
    }else if(error){
        icon = 'bi-exclamation-triangle';
        name = gql_name+', '+error; //.substring(0, 64); // name = 'No response from server'; // `Error: ${error}`
    }else if(failed){
        icon = 'bi-exclamation-triangle';
        name = failed;
    }else{
        open = false;
        name = 'Done';
    }
    const transition = useTransition(open, {
        from:{opacity:0}, enter:{opacity:1}, leave:{opacity:0}, 
        config:{tension:300, friction:10, mass:0.05},
    });
    return transition((style, item) => 
        item && c(animated.div, {style}, 
            render_badge_token({icon, name}),
    ))
}

function update_from_mutation_response({gql_name, data}){ // TODO: varify data saved properly 
    if(gql_name != 'make_nodes') return;
    const result = JSON.parse(data.makeNodes.result);
    const code_keys = Object.entries(result.code_keys);
    if(!code_keys.length) return;
    set_store(d => {
        d.scene.increment(d);
        for(const [node, code_key] of code_keys){
            d.code_keys.set(node, code_key)
        }
    });
}