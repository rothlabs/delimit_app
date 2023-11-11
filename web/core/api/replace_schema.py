from copy import deepcopy
import graphene
from graph import graph
from core.api.config import auth_required_message, core_schema
from terminusdb_client import WOQLQuery as wq

class Replace_Schema(graphene.Mutation):
    class Arguments:
        triples = graphene.String()
        clientInstance = graphene.String()
    reply = graphene.String(default_value = 'Failed to replace schema')
    @classmethod
    def mutate(cls, root, info, triples, clientInstance):
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Replace_Schema(reply = auth_required_message)
            #schema = deepcopy(core_schema)
            
            #graph.insert_document(schema, graph_type='schema', full_replace=True)
            Replace_Schema(reply = 'Replaced schema')
        except Exception as e: 
            print('Push_Assets Error: ')
            print(e)
        return Replace_Schema()