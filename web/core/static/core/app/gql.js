import {useQuery, useLazyQuery, useMutation, gql} from '../apollo/ApolloClient.js';
//import {get_snake_case} from 'delimit';

const queries = compile_gql('query', [
    ['GetUser', [
        ['user id firstName'], 
    ]],
    ['GetRepos', [
        ['repos reply result'], 
    ]],
    ['GetVersion', [
        ['version reply result', 'String id'],
    ]],
    ['GetUpdates', [  
        ['updates reply result'], 
    ]],
]);

export const gql_mutations = [
    ['Login',[
        ['login reply user{firstName}', 
            'String username', 
            'String password',
        ],
    ]],
    ['Logout',[
        ['logout reply user{firstName}'],
    ]],
    ['make_repo', [  
        ['makeRepo error', 'String name', 'String story'],
    ]],
    ['make_meta_repo', [  
        ['makeMetaRepo error', 'String name', 'String story'],
    ]],
    ['edit_repo', [
        ['editRepo error', 'String id', 'String name', 'String story'],
    ]],
    ['drop_repo', [  
        ['dropRepo error', 'String id'],
    ]],
    ['edit_version', [
        ['editVersion error', 'String id', 'String name', 'String story'],
    ]],
    ['drop_versions', [  
        ['dropVersions error', '[String] ids'],
    ]],
    ['make_nodes', [  
        ['makeNodes error result', 'String nodes', 'Boolean includeCodeKeys'], 
    ]],
    ['drop_nodes', [  
        ['dropNodes error', '[String] ids'],
    ]],
];

const mutations = compile_gql('mutation', gql_mutations);

function compile_gql(type, queries_or_mutations){
    const result = {};
    for(const [name, gql_parts] of queries_or_mutations){
        const header_vars = [];
        var header = '';
        var body = '';
        var variables = {};
        //console.log('gql_parts', gql_parts);
        gql_parts.forEach(q => {
            const q_words = q[0].split(' ');
            body += q_words[0];
            if(q.length > 1) body += '(';
            for(var i=1; i<q.length; i++){ 
                const q_var_meta = q[i].split(' ');//const q_var_meta = q[i][0].split(' ');
                if(!header_vars.includes(q_var_meta[1])) header += ', $' + q_var_meta[1] + ': ' + q_var_meta[0];
                body += q_var_meta[1] + ': $' + q_var_meta[1];
                if(i<q.length-1){
                    body += ', ';
                }else{ body += ')'; }
                variables[q_var_meta[1]] = null;//q[i][1] ?? null; // just make it always null !!!! #1
                header_vars.push(q_var_meta[1]);
            }
            body += '{'+q[0].slice(q_words[0].length+1)+'} '; 
        });
        if(header.length > 0) header = '(' + header.slice(2) + ')';
        header = name + header;
        result[name] = [gql`${type} ${header}{${body}}`, variables]; //get_snake_case(name)
    }
        //console.log({header, body, variables});
    return result;//{header, body, variables}
}

export function use_query(selector, arg={}){
    const [query, variables] = queries[selector];
    return useQuery(query, {variables, ...arg}); 
}

export function use_lazy_query(selector, arg={}){
    const [query, variables] = queries[selector];
    return useLazyQuery(query, {variables, ...arg}); 
}

export function use_mutation(selector, arg={}){
    const [mutation, variables] = mutations[selector]; 
    return useMutation( mutation, {variables, ...arg}); 
}









// export function use_query(selector, arg={}){ // name, gql_parts 'cache-and-network'
//     //console.log(fetchPolicy);
//     /////const {header, body, variables} = compile_gql(name, gql_parts);
//     const [query, variables] = queries[selector];
//     //console.log({header, body, variables});
//     //const {loading, error, data, startPolling, refetch} = useQuery(
//     return useQuery(
//         query, {   // gql`query ${header}{${body}}`
//         variables,
//         ...arg, 
//         // fetchPolicy:  arg && arg.fetchPolicy, 
//         // onCompleted:  arg && arg.onCompleted,
//         // pollInterval: arg && arg.pollInterval,
//         // notifyOnNetworkStatusChange: arg && arg.notifyOnNetworkStatusChange,
//     }); 

//     //if(reactive_var) reactive_var(data);
//     //var alt = null;
// 	//if(loading) alt =()=> r(Query_Status, {message: 'Working...'});
//     //if(error)   alt =()=> r(Query_Status, {message: 'Query Error: ' + error.message});
//     //return {data, status:gql_status(loading,error,data,()=>'Done'), startPolling, refetch};
// }
// export function use_mutation(selector, arg={}){
//     const [mutation, variables] = mutations[selector]; //const {header, body, variables} = compile_gql(name, gql_parts);
//     //console.log({header, body, variables});
//     //const [mutate, {data, loading, error, reset}] = useMutation( 
//     return useMutation( 
//         mutation, { // gql`mutation ${header}{${body}}`
//         variables, 
//         ...arg,
//         // refetchQueries: arg && arg.refetch && arg.refetch.split(' '),
//         // onCompleted: arg && arg.onCompleted,
//     }); // Add option for cache
//     //const done=()=> data[gql_parts[0][0].split(' ')[0]].reply;
//     //return {mutate, data, status:gql_status(loading,error,data,done), reset};
// }




// function gql_status(loading, error, data, done){
//     var result = null;// {message: 'Idle'};
// 	if (loading) result=()=> r(Query_Status, {message: 'Working...'});
//     if (error)   result=()=> r(Query_Status, {message: error.message});
//     if (data)    result=()=> r(Query_Status, {message: done()}); 
//     return result;
// }


// const queries = {
//     get_repos: compile_gql('GetReposs', [
//         ['repos data'],
//     ]),
// };

// const repo_keys = [['String team'], ['String repo']];

// const mutations = {
//     open_repo: compile_gql('OpenRepo', [
//         ['openRepo data reply', ...repo_keys]  
//     ]),
//     shut_repo: compile_gql('ShutRepo', [
//         ['shutRepo reply', ...repo_keys]  
//     ]),
//     drop_repo: compile_gql('DropRepo', [  
//         ['dropRepo reply', ...repo_keys]  
//     ]),
// };