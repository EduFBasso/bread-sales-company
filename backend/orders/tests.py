from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from customers.models import Customer
from .models import Order, Product


class OrderCreditLimitValidationTests(TestCase):
	def setUp(self):
		self.client = APIClient()

		self.customer_user = User.objects.create_user(
			username='customer_order_test',
			password='Cliente123!'
		)
		self.customer = Customer.objects.create(
			user=self.customer_user,
			status=Customer.ApprovalStatus.APPROVED,
			customer_type=Customer.CustomerType.JURIDICAL,
			nickname='Padaria Limite',
			phone='11999991111',
			zip_code='01310100',
			street='Av Paulista',
			number='1000',
			neighborhood='Bela Vista',
			city='Sao Paulo',
			state='SP',
			credit_limit='1000.00',
		)

		self.product = Product.objects.create(
			name='Pão de Hamburguer',
			price='10.00',
			is_active=True,
		)

		self.client.force_authenticate(user=self.customer_user)

	def test_reject_order_when_total_exceeds_available_credit(self):
		response = self.client.post(
			'/api/customers/orders/create/',
			{
				'delivery_date': '2026-07-13T10:00:00Z',
				'payment_method': 'CREDIT',
				'items': [
					{
						'product_id': self.product.id,
						'quantity': 200,
					}
				],
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('excede o limite disponível', str(response.data))
		self.assertEqual(Order.objects.count(), 0)

	def test_allow_order_when_total_is_within_available_credit(self):
		response = self.client.post(
			'/api/customers/orders/create/',
			{
				'delivery_date': '2026-07-13T10:00:00Z',
				'payment_method': 'CREDIT',
				'items': [
					{
						'product_id': self.product.id,
						'quantity': 50,
					}
				],
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(Order.objects.count(), 1)
