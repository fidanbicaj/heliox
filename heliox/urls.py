from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^login/', views.login, name='login'),
    url(r'^logout/', views.logout, name='logout'),
    url(r'^tasks/', views.tasks, name='tasks'),
    url(r'^devices/add/', views.add_device, name='add_devices'),
    url(r'^devices/remove/', views.remove_device, name='remove_device')
]