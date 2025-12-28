import sys
import joblib
import os

# Get the absolute path to the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the absolute paths to the model and vectorizer files
model_path = os.path.join(script_dir, 'offensive_language_model.pkl')
vectorizer_path = os.path.join(script_dir, 'vectorizer.pkl')

# Load the model and vectorizer
model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

# Get the input message
message = sys.argv[1]

# Transform the message
X = vectorizer.transform([message])

# Predict the probabilities
probabilities = model.predict_proba(X)[0]
offensive_prob = probabilities[1]  # Probability of being offensive

# Set a custom threshold (e.g., 0.7 instead of 0.5)
THRESHOLD = 0.8
prediction = 1 if offensive_prob >= THRESHOLD else 0

# # Log the details
# print(f"Message: {message}")
# print(f"Offensive Probability: {offensive_prob}")
# print(f"Threshold: {THRESHOLD}")
# print(f"Prediction: {prediction}")

# Output the result
print(prediction)