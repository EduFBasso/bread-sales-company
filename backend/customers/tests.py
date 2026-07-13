from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Customer


class CustomerSecurityActionsTests(TestCase):
	def setUp(self):
		self.client = APIClient()

		self.admin_password = 'SenhaForte!123'
		self.admin = User.objects.create_user(
			username='admin_test',
			password=self.admin_password,
			is_staff=True,
			is_superuser=True,
		)

		customer_user = User.objects.create_user(username='customer_test', password='Cliente123!')
		self.customer = Customer.objects.create(
			user=customer_user,
			status=Customer.ApprovalStatus.PENDING,
			customer_type=Customer.CustomerType.JURIDICAL,
			nickname='Padaria Teste',
			phone='11999990000',
			zip_code='01310100',
			street='Av Paulista',
			number='1000',
			neighborhood='Bela Vista',
			city='Sao Paulo',
			state='SP',
		)

		self.client.force_authenticate(user=self.admin)

	def test_approve_requires_admin_password(self):
		response = self.client.post(
			f'/api/customers/{self.customer.id}/approve',
			{
				'credit_limit': '1000.00',
				'password': 'Cliente123!',
				'confirm_password': 'Cliente123!',
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('admin_password', response.data['detail'])

	def test_approve_rejects_invalid_admin_password(self):
		response = self.client.post(
			f'/api/customers/{self.customer.id}/approve',
			{
				'credit_limit': '1000.00',
				'password': 'Cliente123!',
				'confirm_password': 'Cliente123!',
				'admin_password': 'senha_errada',
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
		self.assertEqual(response.data['detail'], 'Senha do administrador incorreta')

	def test_approve_with_valid_admin_password(self):
		response = self.client.post(
			f'/api/customers/{self.customer.id}/approve',
			{
				'credit_limit': '1000.00',
				'password': 'Cliente123!',
				'confirm_password': 'Cliente123!',
				'admin_password': self.admin_password,
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.customer.refresh_from_db()
		self.assertEqual(self.customer.status, Customer.ApprovalStatus.APPROVED)

	def test_delete_requires_admin_password_for_staff(self):
		response = self.client.delete(f'/api/customers/{self.customer.id}')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('admin_password', response.data['detail'])

	def test_delete_with_valid_admin_password(self):
		response = self.client.delete(
			f'/api/customers/{self.customer.id}',
			{'admin_password': self.admin_password},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
		self.assertFalse(Customer.objects.filter(id=self.customer.id).exists())

	def test_verify_admin_password_requires_password(self):
		response = self.client.post('/api/customers/verify-admin-password', {}, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('admin_password', response.data['detail'])

	def test_verify_admin_password_rejects_invalid_password(self):
		response = self.client.post(
			'/api/customers/verify-admin-password',
			{'admin_password': 'senha_errada'},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
		self.assertEqual(response.data['detail'], 'Senha do administrador incorreta')

	def test_verify_admin_password_accepts_valid_password(self):
		response = self.client.post(
			'/api/customers/verify-admin-password',
			{'admin_password': self.admin_password},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)

	def test_set_password_updates_hash_and_enables_login(self):
		self.customer.status = Customer.ApprovalStatus.APPROVED
		self.customer.save()

		old_password = 'Cliente123!'
		new_password = 'ACwe1md0'

		response = self.client.post(
			f'/api/customers/{self.customer.id}/set-password',
			{
				'password': new_password,
				'confirm_password': new_password,
				'admin_password': self.admin_password,
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)

		self.customer.user.refresh_from_db()
		self.assertTrue(self.customer.user.check_password(new_password))
		self.assertFalse(self.customer.user.check_password(old_password))

		customer_client = APIClient()
		login_response = customer_client.post(
			'/api/customers/login/',
			{'nickname': self.customer.nickname, 'password': new_password},
			format='json',
		)

		self.assertEqual(login_response.status_code, status.HTTP_200_OK)
