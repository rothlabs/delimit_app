import graphene
from graphene_django import DjangoObjectType
from core.models import Product

class ProductType(DjangoObjectType):
    class Meta:
        model = Product
        fields = ('id', 'name', 'date', 'file')

class Query(graphene.ObjectType):
    products = graphene.List(ProductType)
    product = graphene.Field(ProductType, id=graphene.String(required=True))

    def resolve_products(root, info):
        return Product.objects.all()

    def resolve_product(root, info, id):
        try: return Product.objects.get(id=id)
        except Product.DoesNotExist: return None

schema = graphene.Schema(query=Query)



#product_by_name = graphene.Field(ProductType, name=graphene.String(required=True))

# def resolve_product_by_name(root, info, name):
    #     print(name)
    #     try: return Product.objects.get(name=name)
    #     except Product.DoesNotExist: return None