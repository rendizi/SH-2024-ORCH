# SH-2024-ORCH 
## 2nd team 

Orchestrator is the main server, that manages work of agents. 

### Get started 

- clone:

```
git clone https://github.com/rendizi/SH-2024-ORCH
cd SH-2024-ORCH
```

- fill .env according to .env.example 

- build:

```
npm run build
```

- start:

```
npm run start
```

Server is going to start on port 4000. 

### API Routes. 

#### User 

- POST /user/register 

body: 

```
{
    "email":"",
    "password":""
}
```

response:

```
{
	"message": "User registered successfully",
	"userId": 3
}
```

- POST /user/login 

body: 

```
{
    "email":"",
    "password":""
}
```

response: 

```
{
	"accessToken": "",
	"refreshToken": ""
}
```

- GET /user/me 

body: 

```
{
    "email":"",
    "password":""
}
```

response: 

```
{
	"user": {
		"id": 1,
		"email": "baglanov.a0930@gmail.com",
		"password": "",
		"createdAt": "2024-12-07T09:34:53.147Z",
		"services": [
			{
				"id": 1,
				"ip": "8.8.8.8",
				"domain": "google.com",
				"userId": 1,
				"createdAt": "2024-12-07T09:35:12.911Z"
			},
			{
				"id": 2,
				"ip": "62.122.213.120",
				"domain": "-",
				"userId": 1,
				"createdAt": "2024-12-07T12:18:29.710Z"
			}
		],
		"telegrams": []
	}
}
```

- POST /user/refresh-token 

body:

```
{
    "token":""
}
```

response:

```
{
    "accessToken":""
}
```

- POST /user/service 

body: 

```
{
	"domain":"",
	"ip":"",
	"token":""
}
```

response:

```
{
	"message": "Service processed successfully",
	"serviceId": 2
}
```

- POST /user/service/technologies

body: 

```
{
	"serviceId":2,
	"technologies":[
		"git",
		"apache",
		"kernel",
		"linux",
		"os"
	]
}
```

response:
```
{
	"message": "Success"
}
```

- GET /user/service/technologies/:serviceId

response:

```
{
	"technologies": [
		{
			"id": 23,
			"name": "git",
			"serviceId": 2
		},
		{
			"id": 24,
			"name": "apache",
			"serviceId": 2
		},
		{
			"id": 25,
			"name": "kernel",
			"serviceId": 2
		},
		{
			"id": 26,
			"name": "linux",
			"serviceId": 2
		},
		{
			"id": 27,
			"name": "os",
			"serviceId": 2
		}
	]
}
```

- GET localhost:3000/user/reports

params: serviceId, exploitId, agentId - optional 

response:

```
[
	{
		"id": 1,
		"exploitId": 9,
		"serviceId": 1,
		"agentId": 14,
		"verdict": "proccessing...",
		"createdAt": "2024-12-07T06:44:58.485Z",
		"exploit": {
			"id": 9,
			"vulnerability_id": "C723A395-03C5-5419-89D4-CF82DFAE845A",
			"title": "Exploit for Link Following in Git",
			"description": "",
			"publication_date": "2024-05-18",
			"source_link": "https://github.com/safebuffer/CVE-2024-32002",
			"score": 9.8,
			"type": "githubexploit",
			"createdAt": "2024-12-06T17:54:51.247Z"
		},
		"service": {
			"id": 1,
			"ip": "8.8.8.8",
			"domain": "google.com",
			"userId": 1,
			"createdAt": "2024-12-06T18:29:38.591Z"
		},
		"agent": {
			"id": 14,
			"ip": "127.0.0.1",
			"status": "alive",
			"lastActive": "2024-12-07T05:33:15.184Z",
			"createdAt": "2024-12-07T05:33:15.254Z"
		}
	}
]
```

- GET /user/reports/:reportId/steps

response:

```
[
	{
		"id": 1,
		"reportId": 1,
		"command": "git clone https://github.com/callrbx/pkexec-lpe-poc.git && cd pkexec-lpe-poc && make",
		"output": "nothing",
		"ranAt": "2024-12-07T11:43:59.851Z"
	},
	{
		"id": 2,
		"reportId": 1,
		"command": "cd .. && rm -rf pkexec-lpe-poc",
		"output": "nothing",
		"ranAt": "2024-12-07T11:44:03.868Z"
	}
]
```

- GET /user/vulnerabilities/count 

Param userId, serviceId - optional 

response: 

```
{
	"allVulnCount": 4,
	"potentialVulnCount": 1,
	"realVulnCount": 0,
	"noVulnCount": 0
}
```

- GET /user/vulnerabilities/by-days

```
[
	{
		"_count": {
			"id": 1
		},
		"createdAt": "2024-12-07T11:41:46.762Z"
	},
	{
		"_count": {
			"id": 1
		},
		"createdAt": "2024-12-07T11:43:55.501Z"
	},
	{
		"_count": {
			"id": 1
		},
		"createdAt": "2024-12-07T12:20:04.646Z"
	},
	{
		"_count": {
			"id": 1
		},
		"createdAt": "2024-12-07T12:20:05.371Z"
	}
]
```

- GET /user/service/vulnerabilities

Param: serviceId - required 

response: 

```
[
	{
		"id": 2,
		"exploitId": 8,
		"serviceId": 1,
		"verdict": "proccessing...",
		"createdAt": "2024-12-07T11:43:55.501Z",
		"agentId": 1,
		"service": {
			"id": 1,
			"ip": "8.8.8.8",
			"domain": "google.com",
			"userId": 1,
			"createdAt": "2024-12-07T09:35:12.911Z"
		},
		"exploit": {
			"id": 8,
			"vulnerability_id": "5E75D262-B7F4-5039-97FD-FC711D1C0EEF",
			"title": "Exploit for Out-of-bounds Read in Polkit Project Polkit",
			"description": "",
			"publication_date": "2022-01-26",
			"source_link": "https://github.com/callrbx/pkexec-lpe-poc",
			"score": 8.6,
			"type": "githubexploit",
			"createdAt": "2024-12-07T09:51:20.174Z"
		}
	}
]
```

#### Bot

- POST /bot/register 

body:
```
{
    "ip":"",
    "secretKey":""
}
```

response:
```
{
    "token":""
}
```

- POST /bot/execution

Token in Authorization

body:
```
{
    "command":"",
    "output":"",
    "date":""
}
```

- POST /bot/verdict

Token in Authorization

body:
```
{
    "verdict":""
}
```

- POST /bot/error

Token in Authorization