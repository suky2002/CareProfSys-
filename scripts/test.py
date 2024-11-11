# Importăm biblioteca necesară
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Definim calea către fișierul CSV
file_path = "Career_Path_Jobs_Expanded_Romania_Varied.csv"  # Înlocuiește cu calea ta

# Citim fișierul CSV într-un DataFrame
data = pd.read_csv(file_path)

# Afișăm primele câteva rânduri pentru a inspecta structura datelor
print("Primele câteva rânduri ale datasetului:")
print(data.head())

# Dimensiunile datasetului
print("\nDimensiunile datasetului (rânduri, coloane):", data.shape)

# Informații de bază despre coloane (tipuri de date și valori non-null)
print("\nTipuri de date și valori non-null pentru fiecare coloană:")
print(data.info())

# Statistici sumare pentru coloanele numerice
print("\nStatistici sumare pentru coloanele numerice:")
print(data.describe())

# Valorile unice din coloanele 'IndustryCluster' și 'JobTitle'
print("\nValorile unice în 'IndustryCluster':")
print(data['IndustryCluster'].unique())

print("\nValorile unice în 'JobTitle':")
print(data['JobTitle'].unique())

# 1. Filtrare și sortare a datelor
# Filtrare: Joburi din sectorul "Information Technology"
it_jobs = data[data['IndustryCluster'] == 'Information Technology']
print("\nJoburi în sectorul Information Technology:")
print(it_jobs.head())

# Sortare: Ordonați joburile după salariul mediu descrescător
sorted_data = data.sort_values(by='AverageWage', ascending=False)
print("\nPrimele 10 joburi după salariul mediu:")
print(sorted_data.head(10))

# 2. Grupare și agregare
# Media salariului pe fiecare industrie
average_wage_by_industry = data.groupby('IndustryCluster')['AverageWage'].mean()
print("\nSalariul mediu pe industrie:")
print(average_wage_by_industry)

# 3. Vizualizări de date
# Histogramă a salariului de intrare
plt.figure(figsize=(10, 6))
sns.histplot(data['EntryLevelWage'], bins=20)
plt.title('Distribuția salariului de intrare')
plt.xlabel('Salariul de intrare')
plt.ylabel('Număr de joburi')
plt.show()

# Diagrama salariului mediu per industrie
plt.figure(figsize=(12, 8))
sns.boxplot(data=data, x='IndustryCluster', y='AverageWage')
plt.title('Distribuția salariului mediu per industrie')
plt.xticks(rotation=45)
plt.show()

# 4. Analiza corelației
# Matricea de corelație între salariul de intrare și salariul mediu
correlation = data[['EntryLevelWage', 'AverageWage']].corr()
print("\nMatricea de corelație între salariul de intrare și salariul mediu:")
print(correlation)

# Vizualizarea corelației cu un scatter plot
plt.figure(figsize=(8, 6))
sns.scatterplot(data=data, x='EntryLevelWage', y='AverageWage')
plt.title('Corelația între salariul de intrare și salariul mediu')
plt.xlabel('Salariul de intrare')
plt.ylabel('Salariul mediu')
plt.show()

# 5. Exportul datelor prelucrate
# Salvează datele filtrate doar pentru "Information Technology" într-un nou fișier CSV
it_jobs.to_csv('Information_Technology_Jobs_Romania.csv', index=False)
