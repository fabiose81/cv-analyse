import os
import boto3
import json

def create_bucket(bucket_name, criteria_file_name, upload_folder):
    try:       
        # to-do implement transaction  
        s3_client = get_s3_client()                 
        s3_client.create_bucket(Bucket=bucket_name)
        
        add_s3_permission(bucket_name)
        add_lambda_permission(bucket_name)
           
        s3_client.put_bucket_notification_configuration(
            Bucket=bucket_name,
            NotificationConfiguration=get_notification_config_for_lambda()
        )
             
        _, error = upload(bucket_name, upload_folder, criteria_file_name) 
        if not error:   
            return f"Bucket '{bucket_name}' created successfully", None
        
    except Exception as e:
        return None, str(e)

        
def upload(bucket_name, upload_folder, file_name):
    try:      
        s3_client = get_s3_client()    
            
        file = os.path.join(upload_folder, file_name)
        with open(file, "rb") as f:
            s3_client.put_object(
                Bucket=bucket_name,
                Key=file_name,
                Body=f
            )
                
        return f"CV '{file_name}' uploaded successfully", None
    except Exception as e:
        return None, str(e)
   
def list():
    try:
        s3_client = get_s3_client()
        return s3_client.list_buckets()["Buckets"]
    except Exception as e:
        print(e)
        return None, str(e)
         
def get_s3_client():
    try:
        key_id = os.environ['AWS_ACCESS_KEY_ID']
        access_key = os.environ['AWS_SECRET_ACCESS_KEY']
        region = os.environ['REGION_NAME']
            
        return boto3.client('s3',
                    aws_access_key_id = key_id,
                    aws_secret_access_key = access_key,
                    region_name = region)         
            
    except Exception:
        return None

def add_lambda_permission(bucket_name):
    lambda_client = boto3.client("lambda", region_name=os.environ["REGION_NAME"])
        
    lambda_client.add_permission(
        FunctionName=os.environ["LAMBDA_FUNCTION_NAME"],
        StatementId=f"s3invoke-{bucket_name}", 
        Action="lambda:InvokeFunction",
        Principal="s3.amazonaws.com",
        SourceArn=f"arn:aws:s3:::{bucket_name}"
    )
    
def add_s3_permission(bucket_name):
    bucket_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowPutObject",
                "Effect": "Allow",
                "Principal": {"AWS": os.environ["USER_ARN"]},
                "Action": [
                    "s3:PutObject",
                    "s3:GetObject",
                    "s3:ListBucket"
                    ],
                "Resource": [
                    f"arn:aws:s3:::{bucket_name}",
                    f"arn:aws:s3:::{bucket_name}/*"
                ]
            }
        ]
    }
    
    s3_client = get_s3_client()  
    s3_client.put_bucket_policy(
        Bucket=bucket_name,
        Policy=json.dumps(bucket_policy)
    )
        
def get_notification_config_for_lambda():    
    return {
            "LambdaFunctionConfigurations": [
                {
                    "LambdaFunctionArn": os.environ['LAMBDA_FUNCTION_ARN'],
                    "Events": ["s3:ObjectCreated:Put"],
                    "Filter": {
                        "Key": {
                            "FilterRules": [
                                {
                                    "Name": "suffix", 
                                    "Value": ".pdf"
                                    }
                            ]
                        }
                    }
                }
            ]            
        }    