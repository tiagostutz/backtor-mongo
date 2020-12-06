# Backtor Mongo

## Sample usage

Sample `docker-compose.yml` file on how to use backtor-mongo:

```
version: "3.7"

services:

  backtor-mongo-worker:
    image: local/backtor-mongo
    build: .
    environment:
      - MONGO_HOST=<YOUR_MONGO_HOST>
      - MONGO_PORT=<YOUR_MONGO_PORT>
      - MONGO_USER=<YOUR_MONGO_USER>
      - MONGO_PASSWORD=<YOUR_MONGO_PASSWORD>
      - MONGO_DATABASE=<YOUR_MONGO_DATABASE>
      - CONDUCTOR_API_URL=http://backtor-conductor:8080

  backtor:
    image: flaviostutz/backtor
    restart: always
    ports:
      - 6000:6000
    environment:
      - LOG_LEVEL=debug
      - CONDUCTOR_API_URL=http://backtor-conductor:8080/api

  backtor-conductor:
    image: flaviostutz/backtor-conductor
    restart: always
    ports:
      - 8080:8080
    environment:
      - DYNOMITE_HOSTS=dynomite:8102:us-east-1c
      - ELASTICSEARCH_URL=elasticsearch:9300
      - LOADSAMPLE=false
      - PROVISIONING_UPDATE_EXISTING_TASKS=false

  dynomite:
    image: flaviostutz/dynomite:0.7.5
    restart: always
    ports:
      - 8102:8102

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:5.6.8
    restart: always
    environment:
      - "ES_JAVA_OPTS=-Xms512m -Xmx1000m"
      - transport.host=0.0.0.0
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - 9200:9200
      - 9300:9300
    logging:
      driver: "json-file"
      options:
        max-size: "20MB"
        max-file: "5"

  conductor-ui:
    image: flaviostutz/conductor-ui
    restart: always
    environment:
      - WF_SERVER=http://backtor-conductor:8080/api/
    ports:
      - 5000:5000


```

After bringing all this services up the backup stack is ready to go but no schedule has been setup yet. To schedule the backup you need to check the [backtor spec](https://github.com/flaviostutz/backtor) on how to do it. For example, to create a daily backup schedule, you will execute:

```
$ curl --location --request POST 'localhost:6000/backup' \
--header 'Content-Type: application/json' \
--data-raw '{
	"name":"backup_scheule_identification_name",
	"enabled": 1
}'
```

The response will be:

```
{"message":"Backup spec created. name=backup_scheule_identification_name"}
```

This will create a default daily schedule. To check the schedule params, run:

```
$ curl http://localhost:6000/backup
```

The response will be:

```
[
    {
        "name":"backup_scheule_identification_name",
        "enabled":1,
        "backupCronString":"20 20 20 20 * *",
        "workerConfig":"test",
        "timeoutSeconds":10000,
        "lastUpdate":"2020-12-06T06:26:39.066857423Z",
        "retentionMinutely":"3@L",
        "retentionHourly":"0@L",
        "retentionDaily":"4@L",
        "retentionWeekly":"4@L",
        "retentionMonthly":"3@L",
        "retentionYearly":"2@L"
    }
]
```

## Configurations

### MongoDB Connection parameters

Basically you will have to define and pass those environment variables to the backtor-mongo service:

- MONGO_HOST
- MONGO_PORT
- MONGO_USER
- MONGO_PASSWORD
- MONGO_DATABASE

### Volumes

The dumps are stored at the `/dumps` folder, so you can map a volume to this folder.
