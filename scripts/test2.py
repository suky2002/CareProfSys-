import pandas as pd

# Încarcă dataset-ul inițial
file_path = "Career_Path_Jobs_With_Skills_and_MatchScores.csv"
data = pd.read_csv(file_path)

# Dicționar de aptitudini pentru referință (nu este folosit acum în atribuirea scorurilor, doar pentru consultație)
skills_dict = {
    "Information Technology": ["Python", "Java", "SQL", "Problem Solving", "Cybersecurity", "Data Analysis", 
                               "Network Configuration", "Machine Learning", "Cloud Computing", "Software Development", 
                               "Database Management", "Technical Support"],
    "Engineering": ["CAD Software", "Project Management", "Mathematics", "Design Thinking", "Analytical Skills", 
                    "Quality Control", "Mechanical Design", "Electrical Systems", "Civil Engineering", 
                    "Thermodynamics", "Structural Analysis", "Automation"],
    "Finance": ["Financial Analysis", "Accounting Principles", "Data Analysis", "Attention to Detail", 
                "Risk Management", "Budgeting", "Financial Forecasting", "Compliance", "Investment Analysis", 
                "Tax Planning", "Financial Reporting"],
    "Healthcare": ["Patient Care", "Medical Knowledge", "Attention to Detail", "Communication", 
                   "Problem Solving", "Clinical Procedures", "Medical Documentation", "Emergency Response", 
                   "Diagnostic Skills", "Patient Assessment", "Health Education"],
    "Logistics": ["Inventory Management", "Supply Chain Optimization", "Data Entry", "Attention to Detail", 
                  "Project Management", "Freight Management", "Vendor Relations", "Order Processing", 
                  "Logistics Coordination", "Forecasting Demand", "Warehouse Operations"],
    "General": ["Communication", "Time Management", "Teamwork", "Critical Thinking", "Adaptability", 
                "Microsoft Office", "Organizational Skills", "Research", "Customer Service", "Basic Accounting", 
                "Scheduling", "Resource Management"]
}

# Creăm o listă cu toate aptitudinile disponibile
all_skills = list(set(skill for skills in skills_dict.values() for skill in skills))

# Afișăm lista completă de aptitudini și permitem utilizatorului să aleagă 5
print("Alege 5 aptitudini care te reprezintă din lista de mai jos (introdu numărul corespunzător):\n")
for i, skill in enumerate(all_skills, start=1):
    print(f"{i}. {skill}")

# Selectăm aptitudinile de la utilizator
user_selected_skills = []
while len(user_selected_skills) < 5:
    try:
        skill_index = int(input(f"\nAlege aptitudinea {len(user_selected_skills) + 1} (1-{len(all_skills)}): "))
        if 1 <= skill_index <= len(all_skills):
            chosen_skill = all_skills[skill_index - 1]
            if chosen_skill not in user_selected_skills:
                user_selected_skills.append(chosen_skill)
                print(f"Ai ales: {chosen_skill}")
            else:
                print("Aptitudinea este deja selectată. Alege alta.")
        else:
            print("Număr invalid. Introdu un număr din intervalul valid.")
    except ValueError:
        print("Input invalid. Introdu un număr.")

print("\nAptitudinile selectate de tine sunt:", user_selected_skills)

# Funcția de calcul a scorului de compatibilitate între aptitudinile utilizatorului și cele ale jobului
def calculate_match_score(user_skills, job_skills):
    common_skills = set(user_skills).intersection(set(eval(job_skills)))  # Evaluăm stringul pentru a-l converti într-o listă
    return len(common_skills)

# Calculăm scorul de compatibilitate pentru fiecare job și actualizăm coloana 'MatchScore'
data['MatchScore'] = data['Skills'].apply(lambda job_skills: calculate_match_score(user_selected_skills, job_skills))

# Rescriem fișierul CSV cu noile scoruri de compatibilitate
data.to_csv(file_path, index=False)
print(f"Fișierul a fost actualizat cu scorurile de compatibilitate în: {file_path}")
