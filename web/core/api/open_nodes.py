import json
import graphene
#from core.api.types import Pack_Type
from graph.database import gdbc, gdb_connect
from terminusdb_client import WOQLQuery as wq

class Open_Nodes(graphene.Mutation): # rename to Open_Assets and Push_Assets
    class Arguments:
        team = graphene.String()
        package = graphene.String()
        #nodes = graphene.List(graphene.String())
    #pack = graphene.Field(Pack_Type)
    triples = graphene.String(default_value = '{"list":[]}')
    reply = graphene.String(default_value = 'Failed to open nodes.')
    @classmethod
    def mutate(cls, root, info, team, package): # , include, exclude): # offset, limit for pages
        try:
            gdb_connect(info.context.user, team=team, package=package)
            triples = wq().star('v:root', 'v:tag', 'v:stem').execute(gdbc)['bindings'] 
            return Open_Nodes(triples = json.dumps({'list':triples}))
        except Exception as e: 
            print('Error: Open_Nodes')
            print(e)
        return Open_Nodes()


        # triples = wq().select('v:root', 'v:tag', 'v:stem').woql_and(
            #     wq().triple('v:root', '@schema:drop', wq().boolean(False)),
            #     wq().woql_or(
            #         wq().triple('v:root', 'v:tag', 'v:stem'),
            #         wq().woql_and(
            #             wq().triple('v:root', 'v:tag', 'v:cons'),
            #             wq().path('v:cons', 'rdf:rest*,rdf:first', 'v:stem'),
            #         )
            #     ),
            # ).execute(gdbc)['bindings'] 
            # triples = query.execute(gdbc)['bindings']    
            #return Open_Nodes(nodes=Pack_Type(data={'list':triples}), reply='Opened nodes')



        # depth = graphene.Int()
        #include = graphene.List(graphene.List(graphene.String)) # must include nodes that use these atoms with these values 
        #exclude = graphene.List(graphene.List(graphene.String)) # must exclude nodes that use these atoms with these values


                # user_id = wq().string(user.id)
                # triples = wq().select('v:root', 'v:tag', 'v:stem').woql_and(
                #     wq().triple('v:root', '@schema:drop', wq().boolean(False)),
                #     wq().woql_or(
                #         wq().triple('v:root', 'v:tag', 'v:stem'),
                #         wq().woql_and(
                #             wq().triple('v:root', 'v:tag', 'v:cons'),
                #             wq().path('v:cons', 'rdf:rest*,rdf:first', 'v:stem'),
                #         )
                #     ),
                # )

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