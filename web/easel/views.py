from django.views.generic import ListView, UpdateView
from catalog.models import Product, Sketch
from .forms import Edit_Form
import asyncio, json, time#, threading # From Python Built-In

class Index_View(ListView):
    model = Product
    template_name = 'easel/index.html'

class Edit_View(UpdateView):
    model = Product
    form_class = Edit_Form
    template_name = 'easel/edit.html'
    def get_success_url(self): return ''
    def post(self,request,*args,**kwargs):
        #view_state = {'waiting':True} 
        ###cax_worker_event = threading.Event()
        async def cax(data_out):
            reader, writer = await asyncio.open_connection('127.0.0.1',8888)
            writer.write(data_out.encode())
            writer.close()
            #await writer.drain()

            data_in = await reader.read()

            #print(data_in)
            #data_in = json.loads(data_in.decode())
            #if data_in['success']: 
            #    cax_worker_event.set() # CAx done
                ######view_state['waiting'] = False 

            ######await writer.drain()
            

        #def run_cax():
        asyncio.run(cax(json.dumps({
                'sketch_xy': Sketch.objects.get(pk = request.POST['top_sketch']).svg,
                'sketch_yz': Sketch.objects.get(pk = request.POST['side_sketch']).svg,
            })))

        # FOR TESTING ONLY 
        # Instead of waiting for CAx to be done, provide htttp response immediately and 
        # use Django Channels to push updated model when ready
        ###cax_worker = threading.Thread(target=run_cax, daemon=True)
        ###cax_worker.start()
        ###cax_worker_event.wait(timeout=3) # <--- FOR TESTING ONLY
        #while view_state['waiting']: # <--- FOR TESTING ONLY
        #    time.sleep(.01)

        return super(Edit_View,self).post(request,*args,**kwargs)

#with open('../cax/freecad/input/top_sketch.svg', 'w+') as file:
        #    file.write(sketch.svg)