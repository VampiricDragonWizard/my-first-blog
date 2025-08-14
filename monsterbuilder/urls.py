from django.urls import path
from monsterbuilder import views

urlpatterns = [
    path('monsterbuilder/', views.monster_builder, name='monster_builder'),
    path('monsters/', views.MonsterList.as_view(), name='monsters'),
    path('monsterbuilder/<int:pk>/', views.monster_statblock, name='monster_statblock'),
    path('monsterbuilder/api/type', views.monster_builder_api_monstertype, name='monster_builder_api_monstertype'),
    path('monsterbuilder/api/skill', views.monster_builder_api_skill, name='monster_builder_api_skill'),
    path('monsterbuilder/api/feat', views.monster_builder_api_feat, name='monster_builder_api_feat'),
    path('monsterbuilder/api/weapon', views.monster_builder_api_weapon, name='monster_builder_api_weapon'),
    path('monsterbuilder/api/armor', views.monster_builder_api_armor, name='monster_builder_api_armor'),
    path('monsterbuilder/api/special-abilities', views.monster_builder_api_special, name='monster_builder_api_special'),
]