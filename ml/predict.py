import sys
import joblib

# Load the model and vectorizer
model = joblib.load('D:\\tbh trials\\2\\ml\\offensive_language_model.pkl')
vectorizer = joblib.load('D:\\tbh trials\\2\\ml\\vectorizer.pkl')

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