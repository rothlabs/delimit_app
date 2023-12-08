import json
import graphene
from graph.database import gdbc, gdb_connect, gdb_write_access
from terminus import WOQLQuery as wq
from core.models import Repo

class Drop_Node(graphene.Mutation): # rename to Open_Module?! #1
    class Arguments:
        data = graphene.String()
    data  = graphene.String(default_value = 'null')
    reply = graphene.String(default_value = 'Failed to drop node')
    @classmethod
    def mutate(cls, root, info, data): 
        try:
            data = json.loads(data)
            # logic
            return Drop_Node(
                reply = 'Dummy: Drop_Node',
            )
        except Exception as e: 
            print('Error: Drop_Node')
            print(e)
        return Drop_Node()
