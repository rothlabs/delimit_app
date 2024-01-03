import json
import graphene
from core.api.types import Pack_Type
from core.api.config import auth_required_message
from core.models import Repo

class Close_Nodes(graphene.Mutation): 
    class Arguments:
        ids = graphene.List(graphene.String)
    reply = graphene.String(default_value = 'Failed to close nodes')
    @classmethod
    def mutate(cls, root, info, ids): 
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Push_Node(reply = auth_required_message)   
            return Close_Nodes(reply = 'Dummy close nodes')
        except Exception as e: 
            print('Error: Close_Nodes', str(e))
            return Close_Nodes()
