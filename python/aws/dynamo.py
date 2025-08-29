import os
import boto3
from boto3.dynamodb.conditions import Attr

def list(job):
    try:
        region = os.environ['REGION_NAME']
        dynamodb_table = os.environ['DYNAMODB_TABLE_NAME']
        dynamodb = boto3.resource('dynamodb', region_name=region)
        
        table = dynamodb.Table(dynamodb_table) 

        response = table.scan(
            FilterExpression=Attr('bucket').eq(job)
        )
            
        return response['Items']
    except Exception as e:
        return None, str(e)