import {createElement as c} from 'react';
import {animated, useTransition} from '@react-spring/web';
import {
    set_store, get_snake_case, render_badge_token, 
    use_mutation, readable
} from 'delimit';

// TODO: get this list from app/gql.js
// TODO: rename mutations to be camelCase
const mutations = ['MakeRepo', 'MakeMetaRepo', 'DropRepo', 'EditVersion', 'DropVersions', 'MakeNodes', 'DropNodes'];

export function Server_Mutation(){
    return c('div',{className:'position-relative'},
        mutations.map(name => 
            c('div',{className:'position-absolute'},
                c(Mutation, {name})
            ),
        )
    )
}

function Mutation({name}){
    const [mutate, {loading, error, data}] = use_mutation(name, {
        onCompleted:data=>{
            console.log(data);
        },
        //refetchQueries:['GetRepos'],
    }); 
    //console.log(get_snake_case(name));
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
    }
    const transition = useTransition(open, {
        from:{y:'-125%'}, enter:{y:'0%'}, leave:{y:'-125%'}, 
        config:{tension:250, friction:20, mass:0.5},
    });
    return transition((style, item) => item && c(animated.div, {
        style, //: {...style, borderRight:'thick solid var(--bs-secondary)'},
    }, 
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