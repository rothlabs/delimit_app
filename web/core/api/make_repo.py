import json, re, hashlib
import graphene
from core.api.config import auth_required_message, menu_button_svg, braces_svg, plus_square_svg, abc_svg
from core.api.util import conform_user_input, make_node_snaps
from core.models import Repo, Commit, Snap, make_id

class Make_Repo(graphene.Mutation):
    class Arguments:
        name = graphene.String()
        story = graphene.String()
    reply = graphene.String(default_value = 'Failed to make repo')
    @classmethod
    def mutate(cls, root, info, name, story):
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Make_Repo(reply = auth_required_message)
            repo = Repo.objects.create(
                metadata = {
                    'name':  conform_user_input(name,  max_length=64), # name=True),
                    'story': conform_user_input(story, max_length=512),
                }
            )
            repo.writers.add(user)
            repo.readers.add(user)
            commit = Commit.objects.create( # pre select authors and snaps ?!
                repo      = repo,
                metadata = {
                    'name':  'main',
                    'story': 'start',
                },
            )
            commit.authors.add(user)
            make_node_snaps(commit, starter_nodes())
            return Make_Repo(reply = 'Make repo complete')
        except Exception as e: 
            print('Error: Make_Repo')
            print(e)
        return Make_Repo()

def starter_nodes():
    delimit_leaf_node= make_id()
    code_stem        = make_id()
    type_icon_code   = make_id()
    abc_icon_code    = make_id()
    plus_icon_code   = make_id()
    code_icon_code   = make_id()
    name_term        = make_id()
    context_term     = make_id()
    icon_term        = make_id()
    required_term    = make_id()
    optional_term    = make_id()
    pick_one_term    = make_id()
    one_or_more_term = make_id()
    add_term         = make_id()
    make_term        = make_id()
    minimum_term     = make_id()
    maximum_term     = make_id()
    code_term        = make_id()
    root_type        = make_id()
    term_type        = make_id()
    stem_type        = make_id()
    delimit_context  = make_id()
    delimit_app      = make_id()
    return{
        delimit_leaf_node:{ 
            'leaf':[{'type':'xsd:string', 'value':'delimit'}],
        },
        code_stem:{
            'name':    [{'type':'xsd:string', 'value':'Code'}],
            'type':    [{'type':'xsd:string', 'value':'Stem'}],
            'context': [delimit_leaf_node],
        },
        type_icon_code:{
            'name':     [{'type':'xsd:string', 'value':'Type Icon'}],
            'source':   [{'type':'xsd:string', 'value':menu_button_svg}],
            'language': [{'type':'xsd:string', 'value':'SVG'}],
        },
        abc_icon_code:{
            'name':     [{'type':'xsd:string', 'value':'Text Icon'}],
            'source':   [{'type':'xsd:string', 'value':abc_svg}],
            'language': [{'type':'xsd:string', 'value':'SVG'}],
        },
        plus_icon_code:{
            'name':     [{'type':'xsd:string', 'value':'Plus Icon'}],
            'source':   [{'type':'xsd:string', 'value':plus_square_svg}],
            'language': [{'type':'xsd:string', 'value':'SVG'}],
        },
        code_icon_code:{
            'name':     [{'type':'xsd:string', 'value':'Braces Icon'}],
            'source':   [{'type':'xsd:string', 'value':braces_svg}],
            'language': [{'type':'xsd:string', 'value':'SVG'}],
        },
        icon_term:{
            'name':     [{'type':'xsd:string', 'value':'Icon'}],
            'type':     [{'type':'xsd:string', 'value':'Term'}],
            'icon':     [code_icon_code],
            'required': [code_stem],
        },
        name_term:{
            'name':     [{'type':'xsd:string', 'value':'Name'}],
            'type':     [{'type':'xsd:string', 'value':'Term'}],
            'icon':     [abc_icon_code],
            'required': [{'type':'xsd:string', 'value':'String'}],
            'make':     [{'type':'xsd:string', 'value':'New'}],
        },
        context_term:{
            'name':     [{'type':'xsd:string', 'value':'Context'}],
            'type':     [{'type':'xsd:string', 'value':'Term'}],
            'required': [{'type':'xsd:string', 'value':'String'}],
            'add':      [delimit_leaf_node],
        },
        make_term:{
            'name':     [{'type':'xsd:string', 'value':'Make'}],
            'type':     [{'type':'xsd:string', 'value':'Term'}],
            'icon':     [plus_icon_code],
        },
        add_term:{
            'name':     [{'type':'xsd:string', 'value':'Add'}],
            'type':     [{'type':'xsd:string', 'value':'Term'}],
            'icon':     [plus_icon_code],
        },
        minimum_term:{
            'name':     [{'type':'xsd:string', 'value':'Minimum'}],
            'type':     [term_type],
        },
        maximum_term:{
            'name':     [{'type':'xsd:string', 'value':'Maximum'}],
            'type':     [term_type],
        },
        code_term:{
            'name':     [{'type':'xsd:string', 'value':'Code'}],
            'type':     [{'type':'xsd:string', 'value':'Term'}],
            'icon':     [code_icon_code],
            'required': [code_stem],
            'make':     [code_stem],
        },
        required_term:{
            'name':     [{'type':'xsd:string', 'value':'Required'}],
            'type':     [{'type':'xsd:string', 'value':'Term'}],
            'icon':     [type_icon_code],
        },
        optional_term:{
            'name':     [{'type':'xsd:string', 'value':'Optional'}],
            'type':     [{'type':'xsd:string', 'value':'Term'}],
            'icon':     [type_icon_code],
        },
        pick_one_term:{
            'name':     [{'type':'xsd:string', 'value':'Pick One'}],
            'type':     [{'type':'xsd:string', 'value':'Term'}],
            'icon':     [type_icon_code],
        },
        one_or_more_term:{
            'name':     [{'type':'xsd:string', 'value':'One or More'}],
            'type':     [{'type':'xsd:string', 'value':'Term'}],
            'icon':     [type_icon_code],
        },
        root_type:{
            'name':     [{'type':'xsd:string', 'value':'Root'}],
            'icon':     [type_icon_code],
            'required': [name_term],
            'optional': [icon_term, required_term, optional_term, pick_one_term, one_or_more_term, make_term, code_term],
        },
        term_type:{
            'name':     [{'type':'xsd:string', 'value':'Term'}],
            'icon':     [type_icon_code],
            'required': [name_term],
            'optional': [icon_term, required_term, optional_term, pick_one_term, one_or_more_term, make_term, add_term],
        },
        stem_type:{
            'name':     [{'type':'xsd:string', 'value':'Stem'}],
            'icon':     [type_icon_code],
            'required': [name_term, context_term],
            'optional': [icon_term, minimum_term, maximum_term],
        },
        delimit_context:{
            'name':     [delimit_leaf_node],
            'type':     [{'type':'xsd:string', 'value':'Context'}],
            'types':    [root_type, term_type, stem_type],
        },
        delimit_app:{
            'name':        [delimit_leaf_node],
            'type':        [{'type':'xsd:string', 'value':'App'}],
            'delimit_app': [{'type':'xsd:boolean', 'value':True}],
            'contexts':    [delimit_context],
        }
    }

