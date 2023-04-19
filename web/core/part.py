from core.models import Part, Tag, Bool, Int, Float, String

alias = {'p':Part, 't':Tag, 'b':Bool, 'i':Int, 'f':Float, 's':String}

def tagged(tag): return Tag.objects.get(v=tag).r.all()
    #if isinstance(key, int): return Int.objects.get(v=ntc[key]).p.all()
    #else: 
    #return String.objects.get(v=ntc[key]).p.all()

def common(*p): return p[0].intersection(*[p[i].all() for i in range(1,len(p)-1)])

#def children(p): return p.values_list('c', flat=True)

def c_list(p, model): return alias[model].objects.filter(id__in = p.values_list(model, flat=True))


#def public:   return String.objects.get(v='JMUGkRCzV3C7V0Qf').p
#def viewable: return String.objects.get(v='CAOXNrjlhYjWtG8q').p # list of lists, viewable.p contains parts that can be viewed
#def editable: return String.objects.get(v='kAbLj0N34E0HhCnQ').p # list of lists

    # match label:
    #     case 'public':   return String.objects.get(v='JMUGkRCzV3C7V0Qf').p.all()
    #     case 'viewable': return String.objects.get(v='CAOXNrjlhYjWtG8q').p.all()
    #     case 'editable': return String.objects.get(v='kAbLj0N34E0HhCnQ').p.all()

