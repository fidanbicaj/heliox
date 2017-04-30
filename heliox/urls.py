from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^login/', views.login, name='login'),
    url(r'^register/', views.register, name='register'),
    url(r'^dashboard/', views.dashboard, name='dashboard'),
    url(r'^settings/', views.settings, name='settings'),
    url(r'^logout/', views.logout, name='logout'),
    url(r'^json_response/', views.json_response, name='json_response'),
    url(r'^tasks/', views.tasks, name='tasks'),
    url(r'^globe/', views.globe, name='globe'),
]