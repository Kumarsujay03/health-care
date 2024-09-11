from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import pandas as pd
from pymongo import MongoClient, ASCENDING, DESCENDING
from bson import ObjectId
import json
import math
import logging

app = FastAPI()
logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient("mongodb://localhost:27017/")

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        elif isinstance(obj, float):
            if math.isnan(obj) or math.isinf(obj):
                return None
        return super().default(obj)

def sanitize_data(data):
    """Recursively replace non-JSON compliant float values with None and ensure ObjectId fields are converted."""
    if isinstance(data, dict):
        return {k: sanitize_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_data(i) for i in data]
    elif isinstance(data, float):
        if data != data or data == float('inf') or data == float('-inf'):
            return None
        return data
    elif isinstance(data, ObjectId):
        return str(data)
    else:
        return data

@app.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    database: str = Form(...),
    collection_name: str = Form(...),
):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not database or not collection_name:
        raise HTTPException(status_code=400, detail="Database or collection name not provided")

    try:
        df = pd.read_csv(file.file)
        data = df.to_dict(orient='records')
        db = client[database]
        collection = db[collection_name]
        collection.insert_many(data)
        return {"message": "File uploaded successfully"}
    except Exception as e:
        logging.error(f"Error uploading CSV: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/data")
async def get_data(database: str, collection_name: str):
    try:
        db = client[database]
        collection = db[collection_name]
        data = list(collection.find())
        logging.info(f"Fetched {len(data)} documents from {database}.{collection_name}")
        sanitized_data = sanitize_data(data)
        return JSONResponse(content=sanitized_data)
    except Exception as e:
        logging.error(f"Error fetching data from {database}.{collection_name}: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/fields")
async def get_fields(database: str, collection_name: str):
    try:
        db = client[database]
        collection = db[collection_name]
        sample_doc = collection.find_one()
        if not sample_doc:
            raise HTTPException(status_code=404, detail="No documents found in the collection")
        fields = list(sample_doc.keys())
        logging.info(f"Fields in {database}.{collection_name}: {fields}")
        return fields
    except Exception as e:
        logging.error(f"Error fetching fields from {database}.{collection_name}: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/search")
async def search(database: str, collection_name: str, field: str, value: str):
    try:
        db = client[database]
        collection = db[collection_name]
        query = {field: value}
        data = list(collection.find(query))
        logging.info(f"Search results for query {query} in {database}.{collection_name}: {len(data)} documents found")
        sanitized_data = sanitize_data(data)
        return JSONResponse(content=sanitized_data)
    except Exception as e:
        logging.error(f"Error searching in {database}.{collection_name} with query {query}: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/sort")
async def sort_data(database: str, collection_name: str, field: str, order: str, skip: int, limit: int):
    try:
        db = client[database]
        collection = db[collection_name]
        sort_order = ASCENDING if order == 'asc' else DESCENDING
        
        if field == '_id':
            data = list(collection.find().sort("_id", sort_order).skip(skip).limit(limit))
        else:
            data = list(collection.find().sort(field, sort_order).skip(skip).limit(limit))
        
        sanitized_data = sanitize_data(data)
        return JSONResponse(content=sanitized_data)
    except Exception as e:
        logging.error(f"Error sorting data in {database}.{collection_name} by field {field}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/filter")
async def filter(database: str, collection_name: str, field: str, value: str):
    try:
        db = client[database]
        collection = db[collection_name]
        query = {field: value}
        data = list(collection.find(query))
        logging.info(f"Filtered data by field '{field}' with value '{value}' in {database}.{collection_name}: {len(data)} documents found")
        sanitized_data = sanitize_data(data)
        return JSONResponse(content=sanitized_data)
    except Exception as e:
        logging.error(f"Error filtering data in {database}.{collection_name} with query {query}: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/databases")
async def get_databases():
    try:
        databases = client.list_database_names()
        return databases
    except Exception as e:
        logging.error(f"Error fetching databases: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/collections")
async def get_collections(database: str):
    try:
        db = client[database]
        collections = db.list_collection_names()
        return collections
    except Exception as e:
        logging.error(f"Error fetching collections from database {database}: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": str(e)})
