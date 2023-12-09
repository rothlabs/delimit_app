import json
import graphene
from core.api.types import Pack_Type
from core.api.config import auth_required_message
from graph.database import gdbc, gdb_connect, gdb_write_access
from terminus import WOQLQuery as wq
from core.models import Repo

class Drop_Node(graphene.Mutation):
    class Arguments:
        client = graphene.String()
        repo   = graphene.String()
        node   = graphene.List(graphene.String)
    reply = graphene.String(default_value = 'Failed to drop node')
    @classmethod
    def mutate(cls, root, info, client, repo, node):
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Push_Node(reply = auth_required_message)
            team = Repo.objects.get(repo=repo).team
            team, gdb_user = gdb_connect(user, team=team, repo=repo)
            for node in node:
                (wq().triple      (node, '@schema:__forw__', 'v:obj')
                    .delete_triple(node, '@schema:__forw__', 'v:obj')
                    .execute(gdbc))      
            return Drop_Node(reply = 'Drop Node')
        except Exception as e: 
            print('Error: Drop_Node')
            print(e)
            return Drop_Node(reply = 'Error Drop Node: '+str(e))