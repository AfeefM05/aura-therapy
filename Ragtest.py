import pinecone
import requests
import os
from sentence_transformers import SentenceTransformer  # Import SentenceTransformer
from typing import List

class TherapyRAG:
    def __init__(self):
        # Initialize Pinecone client by creating an instance of Pinecone
        pc = pinecone.Pinecone(api_key='pcsk_4Qfm8x_QNXYTXdrJUPCsws2cjDg6PgFwvPf18A7pv11D2BZmjA58DHDUj6AarAzqZYU2nW', environment='us-east-1')  # Replace with your Pinecone API key and environment

        # Pinecone index name
        self.index_name = "therapy"  # Your Pinecone index name
        
        # Connect to the Pinecone index
        self.index = pc.Index(self.index_name)
        
        # Initialize SentenceTransformer model for generating query embeddings
        self.embed_model = SentenceTransformer('all-MiniLM-L6-v2')  # You can choose a different pre-trained model if needed
        
        # RAG configuration
        self.top_k = 3
        self.max_context_length = 1500  # characters

    def _retrieve(self, query: str) -> List[str]:
        # Generate embeddings for the query (using SentenceTransformer)
        query_embed = self.embed_model.encode([query]).astype('float32')
        
        # Perform the search in Pinecone (retrieving top_k nearest neighbors)
        results = self.index.query(query_embed.tolist(), top_k=self.top_k, include_metadata=True)
        
        # Extract and return the corresponding chunks of context from the metadata
        return [match['metadata']['context'] for match in results['matches']]

    def generate_response(self, query: str) -> str:
        # Retrieve relevant context
        context = self._retrieve(query)
        truncated_context = "\n\n".join(context)[:self.max_context_length]
        print(f"context: {truncated_context}")

        # Create a prompt for the external generative model (Google Gemini via Vercel)
        prompt = f"""Based on the following context from therapy sessions:
{truncated_context}

Current patient statement:
{query}

Please provide a compassionate therapeutic response. Do not refer to previous therapy sessions; treat the user as new, and only use the context provided to offer a proper response appropriate for their situation:"""
        
        # Vercel SDK to generate response using Google Gemini
        response = self._generate_vercel_response(prompt)
        return response

    def _generate_vercel_response(self, prompt: str) -> str:
        # Your Vercel API endpoint and key
        vercel_api_url = "https://api.vercel.com/v1/generative-ai/generate"
        api_key = os.getenv('AIzaSyCrUswVG1023WIqnf8a9EI4kGU7yeOiyaY')  # Ensure your API key is set in your environment variables
        
        # Prepare the request payload
        payload = {
            "model": "google('gemini-2.0-flash-exp')",  # Google Gemini model
            "prompt": prompt
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Send request to Vercel API
        try:
            response = requests.post(vercel_api_url, json=payload, headers=headers)
            response.raise_for_status()  # Check if the request was successful
            
            # Parse and return the generated text response
            return response.json().get("text", "Sorry, I couldn't generate a response.")
        except requests.exceptions.RequestException as e:
            print(f"Error generating response: {e}")
            return "Sorry, there was an error processing your request."

# Usage example
rag = TherapyRAG()
user_query = input("Enter query: ")
print(rag.generate_response(user_query))
