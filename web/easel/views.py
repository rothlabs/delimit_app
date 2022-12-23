from django.views import generic
from core.models import Shoe

class List_View(generic.ListView):
    model = Shoe
    template_name = 'easel/list.html'

class Detail_View(generic.DetailView):
    model = Shoe
    template_name = 'easel/detail.html'

    #from django.core.files import File
#from django.conf import settings
#from .forms import Edit_Form
#import asyncio, json, pathlib # From Python Built-In