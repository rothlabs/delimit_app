import {createElement as c} from 'react';
import {animated, useTransition} from '@react-spring/web';
import {
    set_store, gql_mutations, render_badge_token, 
    use_mutation, readable
} from 'delimit';

const mutations = gql_mutations.map(gql => gql[0]); 

export function Server_Mutations(){
    return mutations.map(name => c(Mutation, {name}));
}

function Mutation({name}){
    const [mutate, {loading, error, data}] = use_mutation(name, {
        onCompleted:data=>{
            // TODO: varify proper completion
        },
        //refetchQueries:['GetRepos'],
    }); 
    set_store(d=> d.server[name] = mutate);
    let open = true;
    let icon = 'bi-check-lg';
    if(loading){
        icon = 'bi-hourglass-split';
        name = readable(name);
    }else if(error){
        icon = 'bi-exclamation-triangle';
        name = `Error: ${error}`.substring(0, 64);
    }else{
        open = false;
        name = 'Done';
        //console.log(data);
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


// function Mutation(){
//     const [make_repo] = use_mutation('MakeRepo', {refetchQueries:['GetRepos']}); 
//     const [make_meta_repo] = use_mutation('MakeMetaRepo', {refetchQueries:['GetRepos']}); 
//     const [edit_repo] = use_mutation('EditRepo', {
//         refetchQueries:['GetRepos'],
//         onCompleted:data=>{
//             console.log(data.editRepo.reply);
//         },
//     });
//     const [drop_repo] = use_mutation('DropRepo', {
//         refetchQueries:['GetRepos']
//     });
//     const [edit_version] = use_mutation('EditVersion', {
//         refetchQueries:['GetRepos'],
//         onCompleted:data=>{
//             console.log(data.editVersion.reply);
//         },
//     });
//     const [drop_versions] = use_mutation('DropVersions', {
//         refetchQueries:['GetRepos'],
//         onCompleted:data=>{
//             console.log(data.dropVersions.reply);
//         },
//     });
//     const [make_nodes] = use_mutation('MakeNodes', { // rename to Set_Nodes? #1
//         onCompleted:data=>{
//             console.log(data.makeNodes.reply);
//         },
//     });
//     const [drop_nodes] = use_mutation('DropNodes',{
//         onCompleted:data=>{
//             console.log(data.dropNodes.reply);
//         },
//     });
//     set_store(d=>{ 
//         d.server = {
//             make_repo,
//             make_meta_repo,
//             edit_repo,
//             drop_repo,
//             edit_version,
//             drop_versions,
//             make_nodes,
//             drop_nodes,
//         };
//     });
// }