# Kaggle Benchmark Crop Recommendation Dataset

## Overview
This dataset contains **2,200 empirical agricultural observations** collected across various climatic zones in India. It is used to train machine learning models to recommend the most suitable crop based on soil chemistry and meteorological conditions.

### Target Classes (22 Crops):
1. **Rice** (धान / चावल)
2. **Maize** (मक्का)
3. **Chickpea / Gram** (चना)
4. **Kidney Beans / Rajma** (राजमा)
5. **Pigeonpeas / Arhar** (अरहर)
6. **Mothbeans** (मोठ)
7. **Mungbean** (मूंग)
8. **Blackgram / Urad** (उड़द)
9. **Lentil / Masoor** (मसूर)
10. **Pomegranate** (अनार)
11. **Banana** (केला)
12. **Mango** (आम)
13. **Grapes** (अंगूर)
14. **Watermelon** (तरबूज)
15. **Muskmelon** (खरबूजा)
16. **Apple** (सेब)
17. **Orange** (संतरा)
18. **Papaya** (पपीता)
19. **Coconut** (नारियल)
20. **Cotton** (कपास)
21. **Jute** (पटसन)
22. **Coffee** (कॉफ़ी)

### Input Attributes (7 Features):
- **N**: Ratio of Nitrogen content in soil (kg/ha)
- **P**: Ratio of Phosphorus content in soil (kg/ha)
- **K**: Ratio of Potassium content in soil (kg/ha)
- **temperature**: Temperature in degree Celsius (°C)
- **humidity**: Relative humidity in percentage (%)
- **ph**: Soil pH value (0 - 14)
- **rainfall**: Rainfall in millimeters (mm)

### Model Architecture & Explainability
- Primary Classifier: Multiclass Gaussian Naive Bayes / Random Forest Ensemble
- Validation Accuracy: **99.3%**
- **Explainability**:
  - Distance metrics from cluster centroids
  - Feature match percentage per nutrient
  - Primary limiting factor calculation for yield improvement
