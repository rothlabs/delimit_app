import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth.models import User
from core.models import Product, Part, Float, String, random_id
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

class Part_Type(DjangoObjectType):
    class Meta:
        model = Part
        fields = '__all__'
class Float_Type(DjangoObjectType):
    class Meta:
        model = Float
        fields = '__all__'
class String_Type(DjangoObjectType):
    class Meta:
        model = String
        fields = '__all__'

def all_atoms(parts, model, access):
    def add_atoms(atoms, part):
        atoms = atoms.union(access(part).all())
        for p in part.p.all(): atoms = atoms.union(add_atoms(atoms, p))
        return atoms
    atoms = model.objects.none()
    for p in parts.all(): atoms = add_atoms(atoms, p)
    return atoms

class Product_Type(DjangoObjectType):
    class Meta:
        model = Product
        fields = '__all__'
    p = graphene.List(Part_Type) 
    f = graphene.List(Float_Type) 
    s = graphene.List(String_Type) 
    def resolve_p(self, info):
        try: return all_atoms(self.parts, Part, lambda p:p.p).union(self.parts.all())
        except Exception as e: print(e)
    def resolve_f(self, info):
        try: return all_atoms(self.parts, Float, lambda p:p.f)
        except Exception as e: print(e)
    def resolve_s(self, info):
        try: return all_atoms(self.parts, String, lambda p:p.s)
        except Exception as e: print(e)

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

class Save_Product(graphene.Mutation): 
    class Arguments:
        toNew = graphene.Boolean(required=True)
        id = graphene.String(required=True)
        name = graphene.String(required=True)
        public = graphene.Boolean(required=True)
        story = graphene.String(required=False, default_value = '')
        blob = Upload(required=False, default_value = None)
        parts = graphene.List(graphene.List(graphene.ID, required=False, default_value=[]), required=False, default_value=[])
    product = graphene.Field(Product_Type)
    response = graphene.String(default_value = 'Failed to save or copy product.') 
    @classmethod
    def mutate(cls, root, info, toNew, id, name, public, story, blob, parts):
        try:
            product = None
            if info.context.user.is_authenticated:  
                if toNew:  product = Product.objects.get(id = id)
                else:      product = Product.objects.get(id = id, owner=info.context.user)
                response = 'Saved'
                print(parts)
                #prev_parts = None
                if toNew: 
                    #if not parts: prev_parts = product.parts.all()#[part.id for part in product.parts.all()]
                    response = 'Copied '+product.name+' as '+name
                    product.id = None
                #else: 
                    #if parts: product.parts.set(parts[1:])
                product.name = name
                product.owner = info.context.user
                product.public = public
                if story: product.story = story[1:] # remove first 't' character (use not story == None instead?)
                if blob: product.file.save(random_id()+'.glb', blob, save = True) # automatrically call product.save()
                else: product.file.save(random_id()+'.glb', product.file, save = True) 
                #if toNew: 
                #    if prev_parts: parts = prev_parts
                #    else: parts = Part.objects.filter(id__in=parts[1:])
                #    for part in parts: part.products.add(product.id)
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