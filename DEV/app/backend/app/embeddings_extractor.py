import os
import sqlite3
import pandas as pd
import chromadb
from chromadb.utils import embedding_functions

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Extract Data from SQL
def fetch_from_sql(db_path):
    conn = sqlite3.connect(db_path)
    query = "SELECT question, answer FROM letty_advices"
    df = pd.read_sql(query, conn)
    conn.close()
    return df

# Setup ChromaDB and Embedding Function
def get_vector_store():
    db_chroma_path = os.path.join(BASE_DIR, "..", "data", "chroma_db")
    
    client = chromadb.PersistentClient(path=db_chroma_path)
    
    # Embedding model
    model_name = "all-MiniLM-L6-v2"
    emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=model_name)
    
    collection = client.get_or_create_collection(
        name="nutrition_advices",
        embedding_function=emb_fn
    )
    return collection

if __name__ == "__main__":

    # Process and Load
    db_path = os.path.join(BASE_DIR, "..", "data", "app.sqlite3")
    df = fetch_from_sql(db_path)
    collection = get_vector_store()

    # We'll use the question as the main text to embed, and store the answer in metadata
    documents = df['question'].tolist()
    metadatas = [{"answer": row['answer']} for _, row in df.iterrows()]
    ids = [f"id_{i}" for i in range(len(df))]

    # Add to Chroma
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )

    print(f"Successfully migrated {len(df)} advices to ChromaDB.")

    # Test Search
    results = collection.query(
        query_texts=["How can I lose weight?"],
        n_results=1
    )

    print("\nSimilarity Search Result")
    print(f"Top Match: {results['documents'][0][0]}")
    print(f"Suggested Advice: {results['metadatas'][0][0]['answer']}")