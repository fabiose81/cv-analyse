https://github.com/user-attachments/assets/663295f2-53f5-40db-83ed-967dbb91d00d

![alt text](https://github.com/fabiose81/cv-analyse/blob/master/cv-analyse.jpg?raw=true)

### For Python and AWS/S3/Lambda
    In python folder create a file .env and insert:

    AWS_ACCESS_KEY_ID = {your  key id} 
    AWS_SECRET_ACCESS_KEY = {your secret key} 
    REGION_NAME = {your aws region} 

    USER_ARN=arn:aws:iam::867111115359:user/aws_sdk_boto
    LAMBDA_FUNCTION_NAME = {your lambda function name} 
    LAMBDA_FUNCTION_ARN = {your lambda function arn} 

### Lambda code for AWS Serverless(Python) :: Analyse CV

    import os
    import io
    import uuid
    import boto3
    import json
    from openai import OpenAI

    s3 = boto3.client('s3')

    def get_secret():
        secret_name = "lambda/openai/cv-analyse"
        region_name = "us-east-1"

        session = boto3.session.Session()
        client = session.client(
            service_name='secretsmanager',
            region_name=region_name
        )

        try:
            get_secret_value_response = client.get_secret_value(
                SecretId=secret_name
            )

            return get_secret_value_response['SecretString']
        except ClientError as e:
            raise e

    def get_cv_from_bucket(bucket, key):
        pdf_stream = io.BytesIO()
        s3.download_fileobj(bucket, key, pdf_stream)
        pdf_stream.seek(0)
        return pdf_stream

    def analyse_cv(bucket, key, pdf_stream):
        secret = get_secret()
        api_key = json.loads(secret)["OPENAI_API_KEY"]
        client = OpenAI(api_key=api_key)
        vector_store = client.vector_stores.create(name="pdf-knowledge-base")

        client.vector_stores.files.upload_and_poll(
            vector_store_id=vector_store.id,
            file=(key, pdf_stream)
        )

        response = s3.get_object(Bucket=bucket, Key="criteria.txt")
        content = response["Body"].read().decode("utf-8")
        
        criteria = ""
        for c in content.splitlines():
            criteria += c+"\n"

        criteria = f"\n Analyse the file attached and return a score between 1 and 10 in a json format like {{score: score number}} according the following criteria: \n {criteria} \n "
        print(criteria)
        return client.responses.create(
            model="gpt-4.1-mini", 
            input=criteria,
            tools=[{
                "type": "file_search",
                "vector_store_ids": [vector_store.id]
            }]
        )

    def parse_response(response):
        split_index = response.find("}") + 1

        json_part = response[:split_index]
        comments = response[split_index:].strip()

        return json.loads(json_part), comments

    def save_cv(bucket, key,score, comments):
        dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        table = dynamodb.Table('cv_selected')

        id = str(uuid.uuid4())

        response = table.put_item(
            Item={
                'id': id,
                'bucket': bucket,
                'key': key,
                'score': score,
                'comments': json.dumps(comments)
            }
        )

    def lambda_handler(event, context):
        try:
            bucket = event['Records'][0]['s3']['bucket']['name']
            key = event['Records'][0]['s3']['object']['key']
        
            pdf_stream = get_cv_from_bucket(bucket, key)
            response = analyse_cv(bucket, key, pdf_stream)  
            score, comments = parse_response(response.output[1].content[0].text) 
    
            if score["score"] >= 7:
                print(f"CV selected to saving at DB: {key}")
                save_cv(bucket, key, score, comments)  
                
        except Exception as e:
            print(f"Exception:  {e}")

### For lambda layer

    - Create a build directory:

        mkdir openai-layer
        cd openai-layer
        mkdir python

    - Use Docker to build OpeanAI in Amazon Linux-compatible environment

        Run this in your terminal:

            docker run -v "$PWD"/python:/mnt/output -it public.ecr.aws/lambda/python:3.11 bash

        Inside the container:

            pip install --upgrade pip
            pip install openai -t /mnt/output
            exit

    - Zip the python folder:

        zip -r openai_layer.zip python

    - Upload openai_layer.zip in the layer session for your lambda function 
