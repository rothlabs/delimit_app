import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth.models import User
from core.models import Product, Float_Atom, Part, Part_Prop, Float_Prop, Char_Atom
from django.db.models import Q
from django.contrib.auth import authenticate, login, logout
from graphene_file_upload.scalars import Upload

class Authenticated_User_Type(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email',)

class User_Type(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'first_name',)

# class Vector_Type(DjangoObjectType):
#     class Meta:
#         model = Vector
#         fields = '__all__'

# class Line_Type(graphene.ObjectType):
#     id = graphene.ID() # points to core.models.Group.id
#     name = graphene.String()
#     points = graphene.List(graphene.ID)

# class Sketch_Type(graphene.ObjectType):
#     id = graphene.ID() # points to core.models.Group.id
#     name = graphene.String()
#     lines = graphene.List(graphene.ID)

class Float_Atom_Type(DjangoObjectType):
    class Meta:
        model = Float_Atom
        fields = '__all__'

class Product_Type(DjangoObjectType):
    class Meta:
        model = Product
        fields = '__all__'
    floats  = graphene.List(Float_Atom_Type) 
    #vectors = graphene.List(Vector_Type) 
    #lines   = graphene.List(Line_Type) 
    # def resolve_name(self, info): 
    #     try:
    #         return self.char_prop_set.get(key='name').val
    #     except Exception as e: print(e)
    def resolve_floats(self, info): 
        try: return [float_prop.atom.val for float_prop in 
                self.part.float_prop_set.get(key=Char_Atom.objects.get(val='root'))]
        except Exception as e: print(e)
    # def resolve_vectors(self, info): 
    #     try:
    #         self.part_prop_set.filter(key='vector').
    #     except Exception as e: print(e)
    #     #return self.vector_set.all()
    # def resolve_lines(self, info):
    #     try:

    #         # table = self.line_set.all()
    #         # return[{'id':     id, 
    #         #         'name':   self.group_set.get(id=id).name,
    #         #         'points': [r.point.id for r in table if r.group_id==id]} 
    #         #             for id in {r.group_id for r in table} ]
    #     except Exception as e: print(e)


# class Surface_Type(DjangoObjectType):
#     class Meta:
#         model = Surface
#         fields = ('id', 'name', 'product', 'sketch',)

class Query(graphene.ObjectType):
    user = graphene.Field(Authenticated_User_Type)
    products = graphene.List(Product_Type)
    product = graphene.Field(Product_Type, id=graphene.String(required=True))
    def resolve_user(root, info):
        if info.context.user.is_authenticated: return info.context.user
        else: return None
    def resolve_products(root, info):
        if info.context.user.is_authenticated: return Product.objects.filter(Q(public=True) | Q(owner=info.context.user))
        else: return Product.objects.filter(public=True)
    def resolve_product(root, info, id): # need to check if owner or is public?
        return Product.objects.get(id=id) #return Part.objects.get(id=id)

class Login(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
    user = graphene.Field(User_Type)
    response = graphene.String(default_value = 'Failed to sign in.')
    @classmethod
    def mutate(cls, root, info, username, password):
        user = authenticate(username=username, password=password)
        if user: 
            login(info.context, user)
            return Login(response='Welcome ' + user.first_name, user=user)
        return Login()

class Logout(graphene.Mutation):
    user = graphene.Field(User_Type)
    response = graphene.String(default_value = 'Failed to sign out.')
    @classmethod
    def mutate(cls, root, info):
        if info.context.user.is_authenticated: 
            user = info.context.user
            logout(info.context)
            return Logout(response='Farewell '+user.first_name, user=user)
        return Logout()

class Save_Product(graphene.Mutation): # rename to use _ 
    class Arguments:
        asCopy = graphene.Boolean(required=True)
        id = graphene.String(required=True)
        name = graphene.String(required=True)
        public = graphene.Boolean(required=True)
        story = graphene.String(required=False, default_value = '')
        blob = Upload(required=False, default_value = None)
    product = graphene.Field(Product_Type)
    response = graphene.String(default_value = 'Failed to save or copy product.') 
    @classmethod
    def mutate(cls, root, info, asCopy, id, name, public, story, blob):
        try:
            product = None
            if info.context.user.is_authenticated:  
                if asCopy: product = Product.objects.get(id = id)
                else:      product = Product.objects.get(id = id, owner=info.context.user)
                product.name = name
                product.owner = info.context.user
                product.public = public
                if story: product.story = story[1:] # remove first 't' character
                response = 'Saved'
                if asCopy: 
                    response = 'Copied as ' + name + '.'
                    product.id = None
                if blob: product.file.save(random_id()+'.glb', blob, save = True) # product.file should be file from client when doing regular save
                else: product.file.save(random_id()+'.glb', product.file, save = True)
                return Save_Product(response=response, product=product) 
        except Exception as e: print(e)
        return Save_Product() 

class Delete_Product(graphene.Mutation):
    class Arguments:
        id = graphene.String(required=True)
    product = graphene.Field(Product_Type)
    response = graphene.String(default_value = 'Failed to delete product.')
    @classmethod
    def mutate(cls, root, info, id):
        try:
            product = Product.objects.get(id=id, owner=info.context.user)
            product.delete()
            return Delete_Product(response='Deleted '+product.name + '.', product=product)
        except Exception as e: print(e)
        return Delete_Product()

class Mutation(graphene.ObjectType):
    login = Login.Field()
    logout = Logout.Field()
    saveProduct = Save_Product.Field()
    deleteProduct = Delete_Product.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)







# class CopyProduct(graphene.Mutation):
#     class Arguments:
#         id = graphene.String(required=True)
#         name = graphene.String(required=True)
#         story = graphene.String(required=False, default_value=None)
#     product = graphene.Field(Product_Type)
#     @classmethod
#     def mutate(cls, root, info, id, name, story):
#         product = None
#         if info.context.user.is_authenticated:  
#             product = Product.objects.get(id=id)
#             if product:  
#                 product.id = None
#                 product.name = name
#                 product.owner = info.context.user
#                 product.public = False
#                 if story: product.story = story
#                 product.file.save(random_id() + '.glb', product.file, save = True)
#         return CopyProduct(product=product)


#owner_name = graphene.String()
    #@staticmethod
    #def resolve_owner_name(root, info, **kwargs):
    #    return 'Hello World!'

# @classmethod
#     def get_queryset(cls, queryset, info):
#         if info.context.user.is_anonymous:
#             return queryset.filter(published=True)
#         return queryset

#login = graphene.Field(User_Type, username=graphene.String(required=True), password=graphene.String(required=True))
    #logout = graphene.Field(User_Type)

    #def resolve_login(root, info, username, password):
    #    user = authenticate(username=username, password=password)
    #    if user is not None: login(info.context, user)
    #    return user

    # def resolve_logout(root, info):
    #     if info.context.user.is_authenticated: 
    #         user = info.context.user
    #         logout(info.context)
    #         return user
    #     else: return None

#try: return Product.objects.get(id=id)
#except Product.DoesNotExist: return None

#from django.contrib.auth import authenticate
#user = authenticate(username='john', password='secret')



#product_by_name = graphene.Field(Product_Type, name=graphene.String(required=True))

# def resolve_product_by_name(root, info, name):
    #     print(name)
    #     try: return Product.objects.get(name=name)
    #     except Product.DoesNotExist: return None