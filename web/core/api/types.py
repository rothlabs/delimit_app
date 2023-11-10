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
    data = graphene.String()
    def __init__(self, data): 
        self.data = data
    def resolve_data(self, info): 
        return json.dumps(self.data)