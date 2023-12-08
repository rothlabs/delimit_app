import json
import graphene
from core.api.types import Pack_Type
from core.api.config import auth_required_message
from graph.database import gdbc
from terminus import WOQLQuery as wq

class Push_Node(graphene.Mutation):
    class Arguments:
        client = graphene.String()
        team = graphene.String()
        repo = graphene.String()
        triples = graphene.String()
    reply = graphene.String(default_value = 'Failed to push node')
    @classmethod
    def mutate(cls, root, info, client, team, repo, triples):
        try: # must make sure nodes do not get added to poll_pack if set for delete!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            team, gdb_user = gdb_connect(info.context.user, team=team, repo=repo)
            roots = set()
            for triple_string in triples:
                roots.add(json.loads(triple_string).root)
            for root in roots:
                wq().delete_triple(root, 'v:term', 'v:stem').execute(gdbc)['bindings']
            
            
            return Push_Node(reply='Push Node') 
        except Exception as e: 
            print('Error: Push_Node')
            print(e)
        return Push_Node()


        #     delete_triples = wq().select(root, 'v:term', 'v:stem').woql_and(
            #         wq().woql_or(
            #             wq().triple(root, 'v:term', 'v:stem'),
            #             wq().woql_and(
            #                 wq().triple(root, 'v:term', 'v:cons'),
            #                 wq().path('v:cons', 'rdf:rest*,rdf:first', 'v:stem'),
            #             )
            #         ),
            #         wq().delete_triple(root, 'v:term', 'v:stem'),
            #     ).execute(gdbc)['bindings']  


            # user = info.context.user
            # if not user.is_authenticated: 
            #     return Push_Node(reply = auth_required_message)
            # triples = json.loads(triples)['list']
            # drop_nodes = []
            # nodes = {} 
            # for triple in triples:
            #     r = triple['root']
            #     if triple['tag'] == 'class':
            #         nodes[r] = {'@id':r, '@type': triple['stem']}
            # # for r in nodes:
            # #     clss = nodes[r]['@type']
            # #     for t in graph.schema[clss]:
            # #         if '@class' in graph.schema[clss][t]:
            # #             if graph.schema[clss][t]['@type'] == 'List' or graph.schema[clss][t]['@type'] == 'Set':
            # #                 nodes[r][t] = []
            # for triple in triples:
            #     if triple['tag'][:4] == 'tag:':
            #         r = triple['root']
            #         if not r in nodes:
            #             continue
            #         clss = nodes[r]['@type']
            #         t = triple['tag'][4:]
            #         stem = triple['stem']
            #         if '@class' in graph.schema[clss][t]:
            #             if graph.schema[clss][t]['@type'] == 'List' or graph.schema[clss][t]['@type'] == 'Set':
            #                 nodes[r][t].append(stem)
            #                 continue
                    
            #         nodes[r][t] = stem
            #         if t == 'drop' and stem == True:
            #             drop_nodes.append(r)
            # gdbc.update_document([nodes[k] for k in nodes])
            # if len(drop_nodes) > 0:
            #     gdbc.delete_document(drop_nodes)



                    # try: # exists 
                    #     node = gdbc.get_document(r)
                    #     #nodes[r]['@type'] = node['@type'] # force type to existing node
                    # except: # not exits
                    #     nodes[r]['@type'] = triple['stem'] 
                    # # if nodes[r]['@type'] in core_classes:
                    # #     del nodes[r]

                # if triple['tag'] == 'class':
                #     nodes[r] = {'@id':r}
                #     try: # exists 
                #         node = gdbc.get_document(r)
                #         nodes[r]['@type'] = node['@type'] # force type to existing node
                #         if not r in user_node['asset']:
                #             del nodes[r]
                #     except: # not exits
                #         nodes[r]['@type'] = triple['stem'] 
                #         new_nodes.append(r) 
                #     if nodes[r]['@type'] in system_classes:
                #         del nodes[r]

            # user_triples = wq().woql_and(
            #     wq().triple('v:root', 'rdf:type', '@schema:User'),
            #     wq().triple('v:root', '@schema:user', wq().string(user.id)),
            # ).execute(gdbc)['bindings']
            # user_node = gdbc.get_document(user_triples[0]['root'])
            # new_nodes = []

# if len(new_nodes) > 0:
#     user_node['asset'].extend(new_nodes)
#     gdbc.update_document(user_node)