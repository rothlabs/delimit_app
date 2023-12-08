import json
import graphene
from graph.database import gdbc, gdb_connect, gdb_write_access
from terminus import WOQLQuery as wq
from core.models import Repo

class Open_Node(graphene.Mutation): # rename to Open_Module?! #1
    class Arguments:
        data = graphene.String()
    data = graphene.String(default_value = 'null')
    reply = graphene.String(default_value = 'Failed to open node')
    @classmethod
    def mutate(cls, root, info, data): # , include, exclude): # offset, limit for pages
        try:
            data = json.loads(data)
            # team, gdb_user = gdb_connect(info.context.user, team=team, repo=repo)
            # triples = wq().triple('v:root', 'v:term', 'v:stem').execute(gdbc)['bindings'] # star(subj='root', pred='tag', obj='stem')
            # rdb_repo = Repo.objects.get(repo=repo)
            return Open_Node(
                reply = 'Dummy: Opened Node',
                data = json.dumps({
                    'triples': 'dummy',#triples,
                }),
            )
        except Exception as e: 
            print('Error: Open_Node')
            print(e)
        return Open_Node()
