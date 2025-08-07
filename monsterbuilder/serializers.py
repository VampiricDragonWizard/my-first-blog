from rest_framework import serializers
from monsterbuilder.models import Skill, MonsterType, Weapon, Armor, Feat, SpecialAbility



class MonsterTypeSerializer(serializers.ModelSerializer):
	class Meta:
		model = MonsterType
		fields = ['id', 'name', 'hd_type','atk_as', 'fortitude', 'reflex', 'will',
				  'base_skill_points', 'skill_points', 'base_number_of_feats', 'number_of_feats']

class SkillSerializer(serializers.ModelSerializer):
	class Meta:
		model = Skill
		fields = ['id', 'name', 'modifier', 'synergy']

class FeatSerializer(serializers.ModelSerializer):
	class Meta:
		model = Feat
		fields = ['id', 'name', 'prerequisite', 'has_detail']

class WeaponSerializer(serializers.ModelSerializer):
	class Meta:
		model = Weapon
		fields = ['id', 'name', 'size', 'damage', 'atk_form', 'proficiency']

class ArmorSerializer(serializers.ModelSerializer):
	class Meta:
		model = Armor
		fields = ['id', 'name', 'weight', 'armor_bonus', 'max_dex', 'armor_penalty', 'arcane_failure']

class SpecialAbilitySerializer(serializers.ModelSerializer):
	class Meta:
		model = SpecialAbility
		fields = ['id', 'name', 'shorthand', 'description', 'save_type', 'save_effect', 'save_ability', 'category']