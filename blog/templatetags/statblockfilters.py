from django import template
from math import floor

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

def divide_by(value, divisor):
	"""
	Returns the value divided by divisor and rounded down to the nearest whole number.
	Returns NaN if value is not a number or divisor is zero.
	"""
	try:
		value = int(value)
	except:
		return 'NaN'
	if divisor == 0:
		return 'NaN'
	else:
		return floor(value/divisor)

register.filter("divide_by", divide_by)