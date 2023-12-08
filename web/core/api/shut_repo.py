import json
import graphene
from graph.database import gdbc, gdb_connect, gdb_write_access
from terminus import WOQLQuery as wq
from core.models import Repo

class Shut_Repo(graphene.Mutation): # rename to Open_Module?! #1
    class Arguments:
        data = graphene.String()
    data  = graphene.String(default_value = 'null')
    reply = graphene.String(default_value = 'Failed to shut repo')
    @classmethod
    def mutate(cls, root, info, data): 
        try:
            data = json.loads(data)
            # logic
            return Shut_Repo(
                reply = 'Dummy: Shut_Repo',
            )
        except Exception as e: 
            print('Error: Shut_Repo')
            print(e)
        return Shut_Repo()
