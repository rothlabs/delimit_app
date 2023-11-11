import json
import graphene
from core.api.types import Pack_Type
from graph.database import client as gdb
from terminusdb_client import WOQLQuery as wq

class Open_Assets(graphene.Mutation): # rename to Open_Assets and Push_Assets
    class Arguments:
        depth = graphene.Int()
        ids = graphene.List(graphene.ID)
        include = graphene.List(graphene.List(graphene.String)) # must include nodes that use these atoms with these values 
        exclude = graphene.List(graphene.List(graphene.String)) # must exclude nodes that use these atoms with these values
    pack = graphene.Field(Pack_Type)
    reply = graphene.String(default_value = 'Failed to open pack.')
    @classmethod
    def mutate(cls, root, info, depth, ids, include, exclude): # offset, limit for pages
        try:
            user = info.context.user
            if user.is_authenticated: 
                user_id = wq().string(user.id)
                triples = wq().select('v:root', 'v:tag', 'v:stem').woql_and(
                    wq().triple('v:root', '@schema:drop', wq().boolean(False)),
                    wq().woql_or(
                        wq().triple('v:root', 'v:tag', 'v:stem'),
                        wq().woql_and(
                            wq().triple('v:root', 'v:tag', 'v:cons'),
                            wq().path('v:cons', 'rdf:rest*,rdf:first', 'v:stem'),
                        )
                    ),
                ).execute(gdb)['bindings']    
            return Open_Assets(pack=Pack_Type(data={'list':triples}), reply='Assets Opened')
        except Exception as e: 
            print('Open_Assets Error: ')
            print(e)
        return Open_Assets()


                    # wq().woql_and(
                    #     wq().triple('v:root', 'rdf:type', '@schema:User'),
                    #     wq().triple('v:root', '@schema:user', user_id),
                    #     wq().triple('v:root', 'v:tag', 'v:stem'),
                    # ),
                    # wq().woql_and(
                    #     wq().triple('v:user', 'rdf:type', '@schema:User'),
                    #     wq().triple('v:user', '@schema:user', user_id),
                    #     wq().triple('v:user', '@schema:asset', 'v:root'),
                    #     wq().triple('v:root', '@schema:drop', wq().boolean(False)),
                    #     wq().woql_or(
                    #         wq().triple('v:root', 'v:tag', 'v:stem'),
                    #         wq().woql_and(
                    #             wq().triple('v:root', 'v:tag', 'v:cons'),
                    #             wq().path('v:cons', 'rdf:rest*,rdf:first', 'v:stem'),
                    #         )
                    #     ),
                    # ),