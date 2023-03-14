import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth.models import User
from core.models import Product
from django.db.models import Q
from django.contrib.auth import authenticate, login

class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email')

class ProductType(DjangoObjectType):
    class Meta:
        model = Product
        fields = ('id', 'name', 'date', 'file', 'user', 'public')

class Query(graphene.ObjectType):
    login = graphene.Field(UserType, username=graphene.String(required=True), password=graphene.String(required=True))
    user = graphene.Field(UserType)
    products = graphene.List(ProductType)
    product = graphene.Field(ProductType, id=graphene.String(required=True))

    def resolve_login(root, info, username, password):
        user = authenticate(username=username, password=password)
        if user is not None: login(info.context, user)
        return user

    def resolve_user(root, info):
        if info.context.user.is_authenticated: 
            return info.context.user
        else: return None

    def resolve_products(root, info):
        if info.context.user.is_authenticated: 
            return Product.objects.filter(Q(public=True) | Q(user=info.context.user))
        else: return Product.objects.filter(public=True)

    def resolve_product(root, info, id):
        try: return Product.objects.get(id=id)
        except Product.DoesNotExist: return None

schema = graphene.Schema(query=Query)


#try: return Product.objects.get(id=id)
#except Product.DoesNotExist: return None

#from django.contrib.auth import authenticate
#user = authenticate(username='john', password='secret')



#product_by_name = graphene.Field(ProductType, name=graphene.String(required=True))

# def resolve_product_by_name(root, info, name):
    #     print(name)
    #     try: return Product.objects.get(name=name)
    #     except Product.DoesNotExist: return None