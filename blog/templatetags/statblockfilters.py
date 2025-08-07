from django import template

register = template.Library()

def add_modifier_sign(value):
	"""Adds a plus in front of the value if it's positive or zero, and a minus if it's negative.
	Returns value if it's not a number."""
	try:
		value = int(value)
	except:
		return value
	if value < 0:
		return "-" + str(value)
	else:
		return "+" + str(value)

register.filter("add_modifier_sign", add_modifier_sign)
