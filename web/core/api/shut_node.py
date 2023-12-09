import json
import graphene
from core.api.types import Pack_Type
from core.api.config import auth_required_message
from graph.database import gdbc, gdb_connect, gdb_write_access
from terminus import WOQLQuery as wq
from core.models import Repo

class Shut_Node(graphene.Mutation): 
    class Arguments:
        client = graphene.String()
        repo   = graphene.String()
        node   = graphene.List(graphene.String)
    reply = graphene.String(default_value = 'Failed to shut node')
    @classmethod
    def mutate(cls, root, info, client, repo, node): 
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Push_Node(reply = auth_required_message)   
            return Shut_Node(reply = 'Dummy Shut Node')
        except Exception as e: 
            print('Error: Shut_Node')
            print(e)
            return Shut_Node(reply = 'Error Shut Node: '+str(e))
