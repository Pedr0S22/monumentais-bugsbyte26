import os
import sqlite3
import pandas as pd
from datasets import load_dataset

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def seed_sqlite_with_advices():

    db_path = os.path.join(BASE_DIR, "..", "data", "app.sqlite3")

    csv_path = os.path.join(BASE_DIR, "..", "data", "generated_advices.csv")
    
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    print(f"Connecting to database at: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create the table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS letty_advices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT,
            answer TEXT,
            category TEXT
        )
    ''')

    # Process the general fitness tips dataset
    print("Fetching Hugging Face dataset...")
    fetch_dataset_HF(cursor)

    # Process the general fitness tips dataset
    print(f"Fetching generated advices dataset...")
    fetch_dataset_GA(cursor, csv_path)
    
    # 4. Commit and Close
    conn.commit()
    conn.close()
    print("SQLite seeded successfully!")

def fetch_dataset_HF(cursor):
    try:
        dataset1 = load_dataset("its-myrto/fitness-question-answers", split='train')
        
        hf_data = []
        for row in dataset1:
            # Handle potential casing differences in the HF dataset keys
            q = row.get('Question') or row.get('question')
            a = row.get('Answer') or row.get('answer')
            if q and a:
                hf_data.append((q, a, "Fitness-HF"))
        
        cursor.executemany(
            "INSERT INTO letty_advices (question, answer, category) VALUES (?, ?, ?)",
            hf_data
        )
        print(f"Inserted {len(hf_data)} rows from Hugging Face.")
        
    except Exception as e:
        print(f"Failed to load/insert HF dataset: {e}")

def fetch_dataset_GA(cursor, csv_path):
    try:
        if os.path.exists(csv_path):
            dataset2 = pd.read_csv(csv_path)
            
            dataset2.columns = [c.lower() for c in dataset2.columns]
            
            csv_data = []
            # Use itertuples for faster iteration than iterrows
            for row in dataset2.itertuples(index=False):

                if hasattr(row, 'question') and hasattr(row, 'answer'):
                    csv_data.append((row.question, row.answer, "General-Nutrition"))
            
            cursor.executemany(
                "INSERT INTO letty_advices (question, answer, category) VALUES (?, ?, ?)",
                csv_data
            )
            print(f"Inserted {len(csv_data)} rows from CSV.")
        else:
            print(f"CSV file not found at: {csv_path}")
            
    except Exception as e:
        print(f"Failed to load CSV: {e}")

def clear_letty_advices_table():
    db_path = os.path.join(BASE_DIR, "..", "data", "app.sqlite3")
    print(db_path)
    
    # Check if the database actually exists first
    if not os.path.exists(db_path):
        print("Database not found. Nothing to delete.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # 1. Delete all rows from the table
        cursor.execute("DELETE FROM letty_advices")
        
        # 2. Reset the AUTOINCREMENT counter back to 0
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='letty_advices'")
        
        conn.commit()
        print("Successfully deleted all data and reset the ID counter!")
        
    except sqlite3.OperationalError as e:
        print(f"An error occurred (the table might not exist yet): {e}")
        
    finally:
        conn.close()

if __name__ == "__main__":
    seed_sqlite_with_advices()
    #clear_letty_advices_table()