from database import SessionLocal
from models import DBStudent, DBCourse, DBEnrollment
import uuid
import sys
import random

student_data = [
    ("John Smith", "john.smith@example.com"),
    ("Jane Doe", "jane.doe@example.com"),
    ("Michael Johnson", "michael.johnson@example.com"),
    ("Emily Williams", "emily.williams@example.com"),
    ("David Brown", "david.brown@example.com"),
    ("Sarah Davis", "sarah.davis@example.com"),
    ("James Wilson", "james.wilson@example.com"),
    ("Olivia Martinez", "olivia.martinez@example.com"),
    ("Daniel Anderson", "daniel.anderson@example.com"),
    ("Sophia Taylor", "sophia.taylor@example.com"),
    ("Matthew Thomas", "matthew.thomas@example.com"),
    ("Emma Jackson", "emma.jackson@example.com"),
    ("Christopher White", "christopher.white@example.com"),
    ("Ava Harris", "ava.harris@example.com"),
    ("Andrew Martin", "andrew.martin@example.com"),
    ("Isabella Thompson", "isabella.thompson@example.com"),
    ("Joshua Garcia", "joshua.garcia@example.com"),
    ("Mia Robinson", "mia.robinson@example.com"),
    ("Ryan Clark", "ryan.clark@example.com"),
    ("Charlotte Lewis", "charlotte.lewis@example.com"),
    ("Nicholas Lee", "nicholas.lee@example.com"),
    ("Amelia Walker", "amelia.walker@example.com"),
    ("Brandon Hall", "brandon.hall@example.com"),
    ("Harper Allen", "harper.allen@example.com"),
    ("Tyler Young", "tyler.young@example.com"),
    ("Evelyn Hernandez", "evelyn.hernandez@example.com"),
    ("Jacob King", "jacob.king@example.com"),
    ("Abigail Wright", "abigail.wright@example.com"),
    ("Ethan Lopez", "ethan.lopez@example.com"),
    ("Ella Hill", "ella.hill@example.com"),
    ("Alexander Scott", "alexander.scott@example.com"),
    ("Grace Green", "grace.green@example.com"),
    ("Benjamin Adams", "benjamin.adams@example.com"),
    ("Chloe Baker", "chloe.baker@example.com"),
    ("Samuel Nelson", "samuel.nelson@example.com"),
    ("Lily Carter", "lily.carter@example.com"),
    ("Nathan Mitchell", "nathan.mitchell@example.com"),
    ("Zoey Perez", "zoey.perez@example.com"),
    ("Dylan Roberts", "dylan.roberts@example.com"),
    ("Nora Turner", "nora.turner@example.com"),
    ("Logan Phillips", "logan.phillips@example.com"),
    ("Hannah Campbell", "hannah.campbell@example.com"),
    ("Caleb Parker", "caleb.parker@example.com"),
    ("Addison Evans", "addison.evans@example.com"),
    ("Luke Edwards", "luke.edwards@example.com"),
    ("Scarlett Collins", "scarlett.collins@example.com"),
    ("Owen Stewart", "owen.stewart@example.com"),
    ("Victoria Sanchez", "victoria.sanchez@example.com"),
    ("Gabriel Morris", "gabriel.morris@example.com"),
    ("Aria Rogers", "aria.rogers@example.com"),
    ("Isaac Reed", "isaac.reed@example.com"),
    ("Madison Cook", "madison.cook@example.com"),
    ("Anthony Morgan", "anthony.morgan@example.com"),
    ("Layla Bell", "layla.bell@example.com"),
    ("Julian Murphy", "julian.murphy@example.com"),
    ("Riley Bailey", "riley.bailey@example.com"),
    ("Aaron Rivera", "aaron.rivera@example.com"),
    ("Penelope Cooper", "penelope.cooper@example.com"),
    ("Charles Richardson", "charles.richardson@example.com"),
    ("Ellie Cox", "ellie.cox@example.com"),
    ("Thomas Howard", "thomas.howard@example.com"),
    ("Stella Ward", "stella.ward@example.com"),
    ("Jonathan Torres", "jonathan.torres@example.com"),
    ("Violet Peterson", "violet.peterson@example.com"),
    ("Christian Gray", "christian.gray@example.com"),
    ("Lucy Ramirez", "lucy.ramirez@example.com"),
    ("Aaron James", "aaron.james@example.com"),
    ("Audrey Watson", "audrey.watson@example.com"),
    ("Cameron Brooks", "cameron.brooks@example.com"),
    ("Claire Kelly", "claire.kelly@example.com"),
    ("Adrian Sanders", "adrian.sanders@example.com"),
    ("Skylar Price", "skylar.price@example.com"),
    ("Eli Bennett", "eli.bennett@example.com"),
    ("Anna Wood", "anna.wood@example.com"),
    ("Connor Barnes", "connor.barnes@example.com"),
    ("Sarah Ross", "sarah.ross2@example.com"),
    ("Dominic Henderson", "dominic.henderson@example.com"),
    ("Natalie Coleman", "natalie.coleman@example.com"),
    ("Jeremiah Jenkins", "jeremiah.jenkins@example.com"),
    ("Leah Perry", "leah.perry@example.com"),
    ("Austin Powell", "austin.powell@example.com"),
    ("Samantha Long", "samantha.long@example.com"),
    ("Robert Patterson", "robert.patterson@example.com"),
    ("Brooklyn Hughes", "brooklyn.hughes@example.com"),
    ("Evan Flores", "evan.flores@example.com"),
    ("Savannah Washington", "savannah.washington@example.com"),
    ("Jason Butler", "jason.butler@example.com"),
    ("Camila Simmons", "camila.simmons@example.com"),
    ("Hunter Foster", "hunter.foster@example.com"),
    ("Paisley Gonzales", "paisley.gonzales@example.com"),
    ("Kevin Bryant", "kevin.bryant@example.com"),
    ("Kennedy Alexander", "kennedy.alexander@example.com"),
    ("Brayden Russell", "brayden.russell@example.com"),
    ("Aaliyah Griffin", "aaliyah.griffin@example.com"),
    ("Ian Diaz", "ian.diaz@example.com"),
    ("Elena Hayes", "elena.hayes@example.com"),
    ("Landon Myers", "landon.myers@example.com"),
    ("Maya Ford", "maya.ford@example.com"),
    ("Xavier Hamilton", "xavier.hamilton@example.com"),
    ("Ruby Graham", "ruby.graham@example.com"),
    ("Miles Sullivan", "miles.sullivan@example.com"),
    ("Alice Wallace", "alice.wallace@example.com"),
]

course_data = [
    "Introduction to Googling Your Error Messages",
    "Advanced Copy and Paste Engineering",
    "Database Management: Where Did My Data Go?",
    "Web Development: It Works on My Machine",
    "Data Structures and Mild Frustrations",
    "Computer Networking: Have You Tried Turning It Off?",
    "Operating Systems and Existential Crises",
    "Software Engineering: Debugging Someone Else's Code",
    "Cybersecurity: Password123 Is Not Secure",
    "Python Programming: Indentation Is Everything",
    "Object-Oriented Programming: Everything Is an Object",
    "Cloud Computing: Someone Else's Computer",
    "Frontend Development: Making Things Look Expensive",
    "Artificial Intelligence: Replacing My Homework",
    "Machine Learning: Teaching Computers to Guess",
    "Computer Architecture: Why Is My PC Screaming?",
    "Systems Analysis: It's Probably a User Error",
    "Web Application Security: Please Don't Hack Us",
    "Data Science: Making Numbers Look Interesting",
    "Version Control: Who Broke the Main Branch?",
]


random.shuffle(student_data)
random.shuffle(course_data)


enrollment_data: list[tuple[int, int, float]] = []

for student_index in range(len(student_data)):
    enrollment_count = random.randint(0, 6)
    enrolled_courses = random.sample(range(len(course_data)), enrollment_count)

    for course_index in enrolled_courses:
        grade = round(random.uniform(50, 100), 2)
        enrollment_data.append((student_index, course_index, grade))


db = SessionLocal()

try:
    if (
        db.query(DBStudent)
        .filter(DBStudent.student_email == "john.smith@example.com")
        .first()
        is not None
    ):
        print("Sample data has already been inserted.")
        sys.exit()

    students = [
        DBStudent(
            student_id=str(uuid.uuid4()),
            student_name=name,
            student_email=email,
        )
        for name, email in student_data
    ]

    courses = [
        DBCourse(course_id=str(uuid.uuid4()), course_name=name) for name in course_data
    ]

    enrollments = [
        DBEnrollment(
            student_id=students[student_index].student_id,
            course_id=courses[course_index].course_id,
            grade=grade,
        )
        for student_index, course_index, grade in enrollment_data
    ]

    db.add_all(students)
    db.add_all(courses)
    db.flush()
    db.add_all(enrollments)
    db.commit()

finally:
    db.close()
