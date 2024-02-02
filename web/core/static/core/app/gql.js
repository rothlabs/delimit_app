import {useQuery, useLazyQuery, useMutation, gql} from '../apollo/ApolloClient.js';

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
        ['editRepo error', 'String id', 'String name', 'String story', 'Boolean isPublic'],
    ]],
    ['drop_repo', [  
        ['dropRepo error', 'String id'],
    ]],
    ['edit_version', [
        ['editVersion error', 'String id', 'String name', 'String story', 'Boolean isPublic'],
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
    ['commit_version', [  
        ['commitVersion error', 'String id'],
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
        gql_parts.forEach(q => {
            const q_words = q[0].split(' ');
            body += q_words[0];
            if(q.length > 1) body += '(';
            for(var i=1; i<q.length; i++){ 
                const q_var_meta = q[i].split(' ');
                if(!header_vars.includes(q_var_meta[1])) header += ', $' + q_var_meta[1] + ': ' + q_var_meta[0];
                body += q_var_meta[1] + ': $' + q_var_meta[1];
                if(i<q.length-1){
                    body += ', ';
                }else{ body += ')'; }
                variables[q_var_meta[1]] = null; 
                header_vars.push(q_var_meta[1]);
            }
            body += '{'+q[0].slice(q_words[0].length+1)+'} '; 
        });
        if(header.length > 0) header = '(' + header.slice(2) + ')';
        header = name + header;
        result[name] = [gql`${type} ${header}{${body}}`, variables]; 
    }
    return result;
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