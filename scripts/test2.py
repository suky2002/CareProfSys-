import pandas as pd

file_path = "Career_Path_Jobs_With_Skills_and_MatchScores.csv"
data = pd.read_csv(file_path)

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

all_skills = list(set(skill for skills in skills_dict.values() for skill in skills))

print("Select 5 skills that represent you from the list below (enter the corresponding number):\n")
for i, skill in enumerate(all_skills, start=1):
    print(f"{i}. {skill}")

user_selected_skills = []
while len(user_selected_skills) < 5:
    try:
        skill_index = int(input(f"\nChoose skill {len(user_selected_skills) + 1} (1-{len(all_skills)}): "))
        if 1 <= skill_index <= len(all_skills):
            chosen_skill = all_skills[skill_index - 1]
            if chosen_skill not in user_selected_skills:
                user_selected_skills.append(chosen_skill)
                print(f"You selected: {chosen_skill}")
            else:
                print("This skill has already been selected. Choose another one.")
        else:
            print("Invalid number. Enter a number within the valid range.")
    except ValueError:
        print("Invalid input. Please enter a number.")

print("\nThe skills you selected are:", user_selected_skills)

def calculate_match_score(user_skills, job_skills):
    common_skills = set(user_skills).intersection(set(eval(job_skills)))
    return len(common_skills)

data['MatchScore'] = data['Skills'].apply(lambda job_skills: calculate_match_score(user_selected_skills, job_skills))

data.to_csv(file_path, index=False)
print(f"The file has been updated with compatibility scores: {file_path}")
