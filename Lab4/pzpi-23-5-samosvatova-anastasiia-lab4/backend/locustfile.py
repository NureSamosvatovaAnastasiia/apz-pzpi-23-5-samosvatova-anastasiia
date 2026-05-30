from locust import HttpUser, task, between

class AgrosenseRealUser(HttpUser):
    host = "http://localhost:8080"
    
    wait_time = between(1.0, 5.0)

    @task
    def try_login(self):
        with self.client.post("/api/v1/auth/login", json={
            "email": "loadtest@agrosense.com",
            "password": "someRandomPassword123!"
        }, catch_response=True) as response:
            
            if response.status_code in [200, 401, 404]:
                response.success()
            else:
                response.failure(f"Сервер ліг: {response.status_code}")