from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Skill, Weapon, Armor, Feat, SpecialAbility, MonsterType

class MonsterTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'hd_type', 'atk_as', 'fortitude', 'reflex', 'will',
                    'base_skill_points', 'skill_points', 'base_number_of_feats', 'number_of_feats')

    def get_ordering(self, request):
        return ['name']

class SkillAdmin(admin.ModelAdmin):
    list_display = ('id','name', 'modifier')
    list_filter = ['modifier']
    search_fields = ['name']

    def get_ordering(self, request):
        return ['name']

class FeatAdmin(admin.ModelAdmin):
    list_display = ('id','name', 'prerequisite', 'has_detail')
    list_filter = [('prerequisite', admin.EmptyFieldListFilter), ('has_detail', admin.BooleanFieldListFilter)]

    def get_ordering(self, request):
        return ['name']

class WeaponAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'damage', 'size', 'atk_form', 'proficiency')
    list_filter = ('atk_form', 'proficiency', 'size')

    def get_ordering(self, request):
        return ['name']

class ArmorAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'weight', 'armor_bonus', 'max_dex', 'armor_penalty', 'arcane_failure')
    list_filter = ('weight', 'armor_bonus')

    def get_ordering(self, request):
        return ['weight', 'armor_bonus']

class SpecialAbilityAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'shorthand', 'description', 'save_type', 'save_effect', 'save_ability', 'category')
    list_filter = ['category', 'save_type']

    def get_ordering(self, request):
        return ['category', 'name']

admin.site.register(Skill, SkillAdmin)
admin.site.register(Feat, FeatAdmin)
admin.site.register(Weapon, WeaponAdmin)
admin.site.register(Armor, ArmorAdmin)
admin.site.register(SpecialAbility, SpecialAbilityAdmin)
admin.site.register(MonsterType, MonsterTypeAdmin)