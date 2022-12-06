from django.views.generic import DetailView, ListView, UpdateView
#from django.core.files import File
#from django.conf import settings
from catalog.models import Shoe
#from .forms import Edit_Form
import asyncio, json, pathlib # From Python Built-In

class Index_View(ListView):
    model = Shoe
    template_name = 'easel/index.html'

class Line_Art_Edit_View(DetailView):
    model = Shoe
    template_name = 'easel/line_art_edit.html'