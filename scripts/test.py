import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

file_path = "Career_Path_Jobs_Expanded_Romania_Varied.csv"

data = pd.read_csv(file_path)

print("First few rows of the dataset:")
print(data.head())

print("\nDataset dimensions (rows, columns):", data.shape)

print("\nData types and non-null values for each column:")
print(data.info())

print("\nSummary statistics for numeric columns:")
print(data.describe())

print("\nUnique values in 'IndustryCluster':")
print(data['IndustryCluster'].unique())

print("\nUnique values in 'JobTitle':")
print(data['JobTitle'].unique())

it_jobs = data[data['IndustryCluster'] == 'Information Technology']
print("\nJobs in the Information Technology sector:")
print(it_jobs.head())

sorted_data = data.sort_values(by='AverageWage', ascending=False)
print("\nTop 10 jobs by average wage:")
print(sorted_data.head(10))

average_wage_by_industry = data.groupby('IndustryCluster')['AverageWage'].mean()
print("\nAverage wage per industry:")
print(average_wage_by_industry)

plt.figure(figsize=(10, 6))
sns.histplot(data['EntryLevelWage'], bins=20)
plt.title('Distribution of Entry-Level Wage')
plt.xlabel('Entry-Level Wage')
plt.ylabel('Number of Jobs')
plt.show()

plt.figure(figsize=(12, 8))
sns.boxplot(data=data, x='IndustryCluster', y='AverageWage')
plt.title('Distribution of Average Wage by Industry')
plt.xticks(rotation=45)
plt.show()

correlation = data[['EntryLevelWage', 'AverageWage']].corr()
print("\nCorrelation matrix between entry-level and average wage:")
print(correlation)

plt.figure(figsize=(8, 6))
sns.scatterplot(data=data, x='EntryLevelWage', y='AverageWage')
plt.title('Correlation between Entry-Level and Average Wage')
plt.xlabel('Entry-Level Wage')
plt.ylabel('Average Wage')
plt.show()

it_jobs.to_csv('Information_Technology_Jobs_Romania.csv', index=False)
