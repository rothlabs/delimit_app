import {useQuery, useMutation, gql} from './apollo/ApolloClient.js';

function compile_gql(name, gql_parts){
    const header_vars = [];
    var header = '';
    var body = '';
    var variables = {};
    //console.log('gql_parts', gql_parts);
    gql_parts.forEach(q => {
        const q_words = q[0].split(' ');
        body += q_words[0];
        if(q.length>1) body += '(';
        for(var i=1; i<q.length; i++){ 
            const q_var_meta = q[i][0].split(' ');
            if(!header_vars.includes(q_var_meta[1])) header += ', $' + q_var_meta[1] + ': ' + q_var_meta[0];
            body += q_var_meta[1] + ': $' + q_var_meta[1];
            if(i<q.length-1){
                body += ', ';
            }else{ body += ')'; }
            variables[q_var_meta[1]] = q[i][1] ?? null;
            header_vars.push(q_var_meta[1]);
        }
        body += '{'+q[0].slice(q_words[0].length+1)+'} '; 
    });
    if(header.length>0) header = '(' + header.slice(2) + ')';
    header = name + header;
    //console.log({header, body, variables});
    return {header, body, variables}
}
// function gql_status(loading, error, data, done){
//     var result = null;// {message: 'Idle'};
// 	if (loading) result=()=> r(Query_Status, {message: 'Working...'});
//     if (error)   result=()=> r(Query_Status, {message: error.message});
//     if (data)    result=()=> r(Query_Status, {message: done()}); 
//     return result;
// }
export function use_query(name, gql_parts, arg={}){ // 'cache-and-network'
    //console.log(fetchPolicy);
    const {header, body, variables} = compile_gql(name, gql_parts);
    //console.log({header, body, variables});
    //const {loading, error, data, startPolling, refetch} = useQuery(
    return useQuery(
        gql`query ${header}{${body}}`, {   
        variables,
        ...arg, 
        // fetchPolicy:  arg && arg.fetchPolicy, 
        // onCompleted:  arg && arg.onCompleted,
        // pollInterval: arg && arg.pollInterval,
        // notifyOnNetworkStatusChange: arg && arg.notifyOnNetworkStatusChange,
    }); 

    //if(reactive_var) reactive_var(data);
    //var alt = null;
	//if(loading) alt =()=> r(Query_Status, {message: 'Working...'});
    //if(error)   alt =()=> r(Query_Status, {message: 'Query Error: ' + error.message});
    //return {data, status:gql_status(loading,error,data,()=>'Done'), startPolling, refetch};
}
export function use_mutation(name, gql_parts, arg={}){
    const {header, body, variables} = compile_gql(name, gql_parts);
    //console.log({header, body, variables});
    //const [mutate, {data, loading, error, reset}] = useMutation( 
    return useMutation( 
        gql`mutation ${header}{${body}}`, {
        variables, 
        ...arg,
        // refetchQueries: arg && arg.refetch && arg.refetch.split(' '),
        // onCompleted: arg && arg.onCompleted,
    }); // Add option for cache
    //const done=()=> data[gql_parts[0][0].split(' ')[0]].reply;
    //return {mutate, data, status:gql_status(loading,error,data,done), reset};
}