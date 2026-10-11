from django.urls import path
from . import views

app_name = "mentors"
urlpatterns = [
    path("", views.home, name="home"),
    path("mentors/", views.mentor_list, name="list"),
]
