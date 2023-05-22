# from core.models import Part, Tag, Bool, Int, Float, String
# from core.models import Part_Part, Part_Bool, Part_Int, Part_Float, Part_String
# from aiodataloader import DataLoader

# class Parts_By_Parts_Loader(DataLoader):
#     async def batch_load_fn(self, ids):
#         parts = {part.id: part for part in Part.objects.filter(id__in=ids)}
#         return [parts.get(part_id) for part_id in ids]



from core.models import Part, Tag, Bool, Int, Float, String
from core.models import Part_Part, Part_Bool, Part_Int, Part_Float, Part_String
from collections import defaultdict
from promise import Promise
from promise.dataloader import DataLoader

class Float_E_Loader(DataLoader):
    def batch_load_fn(self, ids):
        print('Float_E_Loader!')
        pfs = defaultdict(list)
        for pf in Part_Float.objects.filter(n__id__in=ids).iterator():
            pfs[pf.n.id].append(pf)
        print(ids)
        print(pfs)
        print([pfs.get(part_id) for part_id in ids])
        return Promise.resolve([pfs.get(part_id) for part_id in ids])

class PF_By_R_Loader(DataLoader):
    def batch_load_fn(self, ids):
        print('PF_By_R_Loader!')
        pfs = defaultdict(list)
        for pf in Part_Float.objects.filter(r__in=ids).iterator():
            pfs[pf.r.id].append(pf)
        print(ids)
        print(pfs)
        print([pfs.get(part_id) for part_id in ids])
        return Promise.resolve([pfs.get(part_id) for part_id in ids])

class PP_By_N_Loader(DataLoader):
    def batch_load_fn(self, ids):
        #print('PP_By_N_Loader!')
        pps = defaultdict(list)

        for pp in Part_Part.objects.filter(n__in=ids).iterator():
            pps[pp.n.id].append(pp)
        #pps = {pp.n.id: pp for pp in Part_Part.objects.filter(n__id=ids)}

        #print(ids)
        #print(pps)
        #print([pps.get(part_id) for part_id in ids])

        return Promise.resolve([pps.get(part_id) for part_id in ids])

class Parts_By_Parts_Loader(DataLoader):
    def batch_load_fn(self, id):
        print('loader in action!')
        #parts = defaultdict(list)
        #parts = {part.id: part for part in Part.objects.filter(id__in=ids)}

        #for part in Part.objects.filter(id__in=ids).iterator():
        #    parts[part.id].append(part)

        #parts = {part.id: part for part in Part.objects.filter(id__in=ids)}
        parts = {part.id: part for part in Part.objects.filter(r__id=id)}

        print([parts.get(part_id) for part_id in ids])

        return Promise.resolve([parts.get(part_id) for part_id in ids])

