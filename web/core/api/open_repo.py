import json
import graphene
#from core.api.types import Pack_Type
from graph.database import gdbc, gdb_connect, gdb_write_access
from terminus import WOQLQuery as wq
from core.models import Repo

# data = json.loads(data)

# '::next::'
#'name___delimit|||app___{'type':'xsd:boolean','value':true}|||'

class Open_Repo(graphene.Mutation): # rename to Open_Module?! #1
    class Arguments:
        client = graphene.String()
        repo = graphene.String()
        #nodes = graphene.List(graphene.String())
    #pack = graphene.Field(Pack_Type)
    #write = graphene.Boolean(default_value = False)
    data = graphene.String(default_value = 'null')
    reply = graphene.String(default_value = 'Failed to open repo')
    @classmethod
    def mutate(cls, root, info, client, repo): # , include, exclude): # offset, limit for pages
        try:
            team = Repo.objects.get(repo=repo).team
            team, gdb_user = gdb_connect(info.context.user, team=team, repo=repo)
            #triples = wq().star(subj='v:root', pred='v:term', obj='v:stem').execute(gdbc)['bindings']
            rdb_repo = Repo.objects.get(repo=repo)
            node = wq().triple('v:node', '@schema:__forw__', 'v:obj').execute(gdbc)['bindings']
            return Open_Repo(
                reply = 'Opened nodes',
                data = json.dumps({
                    'repo':{
                        'repo': repo,
                        'team': team,
                        'name': rdb_repo.name, 
                        'description': rdb_repo.description,
                        'write_access': gdb_write_access(team, repo, gdb_user),
                    },
                    'node': node,
                }),
            )
        except Exception as e: 
            print('Error: Open_Repo')
            print(e)
        return Open_Repo()


            # data = {}
            # for item in sequence.split(']::['):
            #     data[item] = []
            #     for item in item.split('>>>'):
            #         data[item].append()


#triples = wq().triple('v:root', 'v:term', 'v:stem').execute(gdbc)['bindings'] # star(subj='root', pred='term', obj='stem')


            # triples = wq().select('v:root', 'v:term', 'v:stem').woql_or(
            #     wq().triple('v:root', 'v:term', 'v:stem'),
            #     wq().woql_and(
            #         wq().triple('v:root', 'v:term', 'v:cons'),
            #         wq().path('v:cons', 'rdf:rest*,rdf:first', 'v:stem'),
            #     )
            # ).execute(gdbc)['bindings']    



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
            #return Open_Module(nodes=Pack_Type(data={'list':triples}), reply='Opened nodes')





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