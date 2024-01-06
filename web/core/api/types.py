import json
from django.contrib.auth.models import User
import graphene
from graphene_django import DjangoObjectType

class Authenticated_User_Type(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email',)

class User_Type(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'first_name',)

class Pack_Type(graphene.ObjectType):
    reply = graphene.String()
    result = graphene.String()
    def __init__(self, result, reply='Query complete'): 
        self.result = result
        self.reply = reply
    def resolve_result(self, info):
        return self.reply
    def resolve_result(self, info): 
        return json.dumps(self.result)