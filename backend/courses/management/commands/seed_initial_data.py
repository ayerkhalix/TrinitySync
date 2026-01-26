"""
Django management command to seed all initial data:
- Colleges (CET and CNHS only)
- Programs (BSIT, BSCpE, BSGE, BSCE under CET; BSN under CNHS)
- Courses (from the provided dataset)
"""
import re
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from colleges.models import College, Program
from courses.models import Course, CoursePrerequisite
from scheduling.models import SchoolYear


class Command(BaseCommand):
    help = 'Seed all initial data for the scheduling system'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--create-users',
            action='store_true',
            help='Create sample users for testing'
        )
        parser.add_argument(
            '--skip-courses',
            action='store_true',
            help='Skip course creation'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to seed all data...'))
        
        with transaction.atomic():
            # 1. Create Colleges (CET and CNHS only)
            colleges = self.create_colleges()
            
            # 2. Create Programs
            programs = self.create_programs(colleges)
            
            # 3. Create Courses from provided dataset (unless skipped)
            if not options.get('skip_courses', False):
                self.create_courses(programs)
            
            # 4. Create School Years
            self.create_school_years()
            
            # 5. Create Sample Users (optional)
            if options.get('create_users', False):
                self.create_sample_users(colleges, programs)
            
            self.stdout.write(self.style.SUCCESS('Successfully seeded all data!'))
    
    def create_colleges(self):
        """Create CET and CNHS colleges only."""
        colleges_data = [
            {
                'code': 'CET',
                'name': 'College of Engineering and Technology',
                'description': 'College of Engineering, Information Technology, and Computer Engineering'
            },
            {
                'code': 'CNHS',
                'name': 'College of Nursing and Health Sciences',
                'description': 'College of Nursing and Health Sciences'
            }
        ]
        
        colleges = {}
        for data in colleges_data:
            college, created = College.objects.update_or_create(
                code=data['code'],
                defaults=data
            )
            action = "Created" if created else "Updated"
            self.stdout.write(
                self.style.SUCCESS(f"{action} College: {college.code} - {college.name}")
            )
            colleges[data['code']] = college
        
        return colleges
    
    def create_programs(self, colleges):
        """Create programs under each college."""
        programs_data = [
            # College of Engineering and Technology (CET)
            {
                'college': 'CET',
                'code': 'BSIT',
                'name': 'Bachelor of Science in Information Technology',
                'degree_type': Program.DegreeType.BACHELORS,
                'total_units': 180,
                'duration_years': 4
            },
            {
                'college': 'CET',
                'code': 'BSCpE',
                'name': 'Bachelor of Science in Computer Engineering',
                'degree_type': Program.DegreeType.BACHELORS,
                'total_units': 200,
                'duration_years': 4
            },
            {
                'college': 'CET',
                'code': 'BSGE',
                'name': 'Bachelor of Science in Geodetic Engineering',
                'degree_type': Program.DegreeType.BACHELORS,
                'total_units': 210,
                'duration_years': 4
            },
            {
                'college': 'CET',
                'code': 'BSCE',
                'name': 'Bachelor of Science in Civil Engineering',
                'degree_type': Program.DegreeType.BACHELORS,
                'total_units': 220,
                'duration_years': 5
            },
            # College of Nursing and Health Sciences (CNHS)
            {
                'college': 'CNHS',
                'code': 'BSN',
                'name': 'Bachelor of Science in Nursing',
                'degree_type': Program.DegreeType.BACHELORS,
                'total_units': 190,
                'duration_years': 4
            }
        ]
        
        programs = {}
        for data in programs_data:
            college = colleges[data.pop('college')]
            program, created = Program.objects.update_or_create(
                college=college,
                code=data['code'],
                defaults={**data, 'college': college}
            )
            action = "Created" if created else "Updated"
            self.stdout.write(
                self.style.SUCCESS(f"{action} Program: {program.code} - {program.name}")
            )
            programs[data['code']] = program
        
        return programs
    
    def create_courses(self, programs):
        """Create courses from the provided dataset."""
        # Raw course data from the INSERT statements (cleaned and normalized)
        raw_courses = self.get_raw_course_data()
        
        course_count = 0
        skipped_courses = []
        
        for course_data in raw_courses:
            try:
                program_code = course_data['program']
                program = programs.get(program_code)
                
                if not program:
                    skipped_courses.append((course_data['course_code'], f"Program {program_code} not found"))
                    continue
                
                # Clean and normalize data
                course_code = self.clean_course_code(course_data['course_code'])
                course_title = self.clean_course_title(course_data['course_description'])
                
                # Skip duplicates (some courses appear multiple times in the data)
                if Course.objects.filter(program=program, course_code=course_code).exists():
                    # Check if it's actually the same course with same semester
                    existing = Course.objects.get(program=program, course_code=course_code)
                    if (existing.year_level == course_data['year_level'] and 
                        existing.semester == course_data['semester']):
                        skipped_courses.append((course_code, "Duplicate course with same semester"))
                        continue
                
                # Determine units based on course type
                units = self.determine_units(course_code, course_title)
                
                # Create course
                course = Course.objects.create(
                    program=program,
                    course_code=course_code,
                    course_title=course_title,
                    year_level=course_data['year_level'],
                    semester=course_data['semester'],
                    units=units,
                    lecture_hours=3 if units >= 3 else units,
                    laboratory_hours=0 if units <= 3 else units - 3,
                    is_core=not any(x in course_code.upper() for x in ['NSTP', 'PATHFIT', 'PATH FIT', 'PE']),
                    is_active=True
                )
                
                course_count += 1
                if course_count % 20 == 0:
                    self.stdout.write(f"Created {course_count} courses...")
                
            except Exception as e:
                skipped_courses.append((course_data.get('course_code', 'Unknown'), str(e)))
        
        # Summary
        self.stdout.write(self.style.SUCCESS(f"\nCreated {course_count} courses"))
        if skipped_courses:
            self.stdout.write(self.style.WARNING(f"\nSkipped {len(skipped_courses)} courses:"))
            for code, reason in skipped_courses[:10]:  # Show first 10
                self.stdout.write(f"  {code}: {reason}")
            if len(skipped_courses) > 10:
                self.stdout.write(f"  ... and {len(skipped_courses) - 10} more")
    
    def get_raw_course_data(self):
        """Return parsed course data from the provided SQL."""
        # This is the cleaned and normalized version of your INSERT statements
        return [
            # ========== BSIT COURSES ==========
            # First Year - First Trimester
            {'course_code': 'ITTF 101', 'course_description': 'Information Technology Fundamentals', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'ITAM 132', 'course_description': 'Applied Engineering Mathematics', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'GEUS 201', 'course_description': 'Understanding the Self', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'GEPH 202', 'course_description': 'Readings in Philippine History', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'RESH 401', 'course_description': 'Salvation History', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'PATHFIT 100', 'course_description': 'Physical Activities Toward Health and Fitness Movement Competency Training', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'NSTP 201', 'course_description': 'National Service Training Program', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'first_sem'},
            
            # First Year - Second Trimester
            {'course_code': 'ITIC 102', 'course_description': 'Introduction to Computing', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'GEES 210', 'course_description': 'Environmental Science', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'GECW 203', 'course_description': 'The Contemporary World', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'GEMM 204', 'course_description': 'Mathematics in Modern World', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'RECM 402', 'course_description': 'Christology and Mariology', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'PATHFIT 200', 'course_description': 'Physical Activities Toward Health and Fitness Exercise Based Fitness Activities', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'NSTP 202', 'course_description': 'CWTS', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'second_sem'},
            
            # First Year - Third Trimester
            {'course_code': 'ITIC 103', 'course_description': 'Introduction to Human Computer Interaction', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEIC 211', 'course_description': 'Philippine Indigenous Communities', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEPC 205', 'course_description': 'Purposive Communication', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEAA 206', 'course_description': 'Art Appreciation', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEST 207', 'course_description': 'Science, Technology and Society', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'RELS 403', 'course_description': 'Liturgy and Sacraments, Christian Morality and Social Responsibility with Palawan Environmental Laws', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'PATHFIT 300', 'course_description': 'Physical Activities Toward Health and Fitness Menu of Dance Sports', 'program': 'BSIT', 'year_level': 'first_year', 'semester': 'third_sem'},
            
            # Second Year - First Trimester
            {'course_code': 'ITCP 105', 'course_description': 'Computer Programming 1 (Fundamentals of Programming)', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'ITCI 104', 'course_description': 'Human Computer Interaction 2', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'ITIM 107', 'course_description': 'Fundamentals of Information Management', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'GEEM 212', 'course_description': 'The Entrepreneurial Mind', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'GEET 208', 'course_description': 'Ethics', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'RECH 404', 'course_description': 'Church History, Catechesis and Church Documents', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'PATHFIT 400', 'course_description': 'Physical Activities Toward Health and Fitness Menu of Outdoor and Adventure Activities', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'first_sem'},
            
            # Second Year - Second Trimester
            {'course_code': 'ITCP 106', 'course_description': 'Computer Programming 2 (Intermediate Programming)', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'ITDS 108', 'course_description': 'Data Structures and Algorithms', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'ITIM 109', 'course_description': 'Information Management', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'ITDS 110', 'course_description': 'Fundamentals of Database Systems', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'ITOP 111', 'course_description': 'Object Oriented Programming', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'ITNT 114', 'course_description': 'Networking 1 (Fundamentals of Networking)', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'second_sem'},
            
            # Second Year - Third Trimester
            {'course_code': 'ITAD 112', 'course_description': 'Application Development and Emerging Technologies', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'ITED 113', 'course_description': 'Event Driven Programming', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'GERL 209', 'course_description': 'Life and Works of Rizal', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'ITIP 116', 'course_description': 'Integrative Programming & Technologies 1', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'ITSI 117', 'course_description': 'System Integration & Architecture 1', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'ITWS 124', 'course_description': 'Web System and Technologies', 'program': 'BSIT', 'year_level': 'second_year', 'semester': 'third_sem'},
            
            # Third Year - First Trimester
            {'course_code': 'ITNT 115', 'course_description': 'Networking 2 (Advanced Networking)', 'program': 'BSIT', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ITIA 120', 'course_description': 'Information Assurance and Security 1', 'program': 'BSIT', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ITSA 122', 'course_description': 'System Administration and Maintenance', 'program': 'BSIT', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ITTE 129', 'course_description': 'Technopreneurship', 'program': 'BSIT', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ITDM 119', 'course_description': 'Discrete Mathematics', 'program': 'BSIT', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ITCP 125', 'course_description': 'Capstone Project & Research 1', 'program': 'BSIT', 'year_level': 'third_year', 'semester': 'first_sem'},
            
            # Third Year - Second Trimester
            {'course_code': 'ITCP 126', 'course_description': 'Capstone & Research 2', 'program': 'BSIT', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'ITPR 130', 'course_description': 'Practicum', 'program': 'BSIT', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'ITFS 131', 'course_description': 'Fieldtrips and Seminars', 'program': 'BSIT', 'year_level': 'third_year', 'semester': 'second_sem'},
            
            # Third Year - Third Trimester
            {'course_code': 'ITSI 127', 'course_description': 'Social and Professional Issues', 'program': 'BSIT', 'year_level': 'third_year', 'semester': 'third_sem'},
            {'course_code': 'ITIA 121', 'course_description': 'Information Assurance and Security 2', 'program': 'BSIT', 'year_level': 'third_year', 'semester': 'third_sem'},
            {'course_code': 'ITQM 128', 'course_description': 'Quantitative Methods (including Modelling & Simulation)', 'program': 'BSIT', 'year_level': 'third_year', 'semester': 'third_sem'},
            {'course_code': 'ITPT 123', 'course_description': 'Platform Technologies (Elective 1)', 'program': 'BSIT', 'year_level': 'third_year', 'semester': 'third_sem'},
            {'course_code': 'ITSI 118', 'course_description': 'System Integration & Architecture 2', 'program': 'BSIT', 'year_level': 'third_year', 'semester': 'third_sem'},
            
            # ========== BSCpE COURSES ==========
            # First Year - First Trimester
            {'course_code': 'EIAM 101', 'course_description': 'Applied Engineering Mathematics', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'ECpED 101', 'course_description': 'Computer Engineering as a Discipline', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'ENCE 301', 'course_description': 'Chemistry for Engineers', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'GEUS 201', 'course_description': 'Understanding the Self', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'EBCA 311', 'course_description': 'Computer Aided Drafting', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'RESH 401', 'course_description': 'Salvation History', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'PATHFIT 100', 'course_description': 'Physical Activities Toward Health and Fitness Movement Competency Training', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'NSTP 201', 'course_description': 'National Service Training Program 1', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'first_sem'},
            
            # First Year - Second Trimester
            {'course_code': 'ECpBO 112', 'course_description': 'Basic Occupational Health & Safety', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'EMDC 301', 'course_description': 'Differential Calculus', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'GEPH 202', 'course_description': 'Readings in Philippine History', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'GECW 203', 'course_description': 'Contemporary World', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'RECM 402', 'course_description': 'Christology and Mariology', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'PATHFIT 200', 'course_description': 'Physical Activities Toward Health and Fitness Exercise Based Fitness Activities', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'NSTP 202', 'course_description': 'National Service Training Program 2', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'second_sem'},
            
            # First Year - Third Trimester
            {'course_code': 'EMIC 302', 'course_description': 'Integral Calculus', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'EPPE 305', 'course_description': 'Physics for Engineers', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEMM 204', 'course_description': 'Mathematics in Modern World', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEPC 205', 'course_description': 'Purposive Communication', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEAA 206', 'course_description': 'Art Appreciation', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'RELS 403', 'course_description': 'Liturgy and Sacraments, Christian Morality and Social Responsibility with Palawan Environmental Laws', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'PATHFIT 300', 'course_description': 'Physical Activities Toward Health and Fitness Menu of Dance Sports', 'program': 'BSCpE', 'year_level': 'first_year', 'semester': 'third_sem'},
            
            # Second Year - First Trimester
            {'course_code': 'EMDA 303', 'course_description': 'Engineering Data Analysis', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'ECpED 101', 'course_description': 'Fundamentals of Electrical Circuits', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'ECpDD 106', 'course_description': 'Computer Engineering Drafting and Design', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'GEES 210', 'course_description': 'Environmental Science with Palawan Environmental laws', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'GEST 207', 'course_description': 'Science, Technology and Society', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'EBEE 308', 'course_description': 'Engineering Economics', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'RECH 404', 'course_description': 'Church History, Catechesis and Church Documents', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'PATHFIT 400', 'course_description': 'Physical Activities Toward Health and Fitness Menu of Outdoor and Adventure Activities', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'first_sem'},
            
            # Second Year - Second Trimester
            {'course_code': 'EMDE 305', 'course_description': 'Differential Equation', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'EAFC 301', 'course_description': 'Fundamentals of Electronic Circuits', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'ECpFM 105', 'course_description': 'Fundamentals of Mixed Signals and Sensors', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'ECpOS 115', 'course_description': 'Operating System', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'ECpDD 106', 'course_description': 'Data and Digital Communication', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'GEET 208', 'course_description': 'Ethics', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'GEIC 211', 'course_description': 'Philippine Indigenous Communities', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'second_sem'},
            
            # Second Year - Third Trimester
            {'course_code': 'ECpNM 103', 'course_description': 'Numerical Methods', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'ECpLC 108', 'course_description': 'Logic Circuit Design', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'ECpPL 104', 'course_description': 'Programming Logic and Design', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'ECpHD 110', 'course_description': 'Introduction to HDL', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'ECpMR 114', 'course_description': 'Method of Research', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'ECpCA 120', 'course_description': 'Computer Architecture and Organization', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'GERL 209', 'course_description': 'Life and Works of Rizal', 'program': 'BSCpE', 'year_level': 'second_year', 'semester': 'third_sem'},
            
            # Third Year - First Trimester
            {'course_code': 'ITDM 119', 'course_description': 'Discrete Math', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ITDS 108', 'course_description': 'Data Structures and Algorithms', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ECpET 101', 'course_description': 'Emerging Technologies in CpE', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ECpFCS 101', 'course_description': 'Feedback and Control System', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ECpPD 101', 'course_description': 'CpE Practice and Design 1', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ECpMP 101', 'course_description': 'Microprocessor', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'GEEM 212', 'course_description': 'The Entrepreneurial Mind', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'first_sem'},
            
            # Third Year - Second Trimester
            {'course_code': 'ECpLP 111', 'course_description': 'CpE Laws and Professional Practice', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'ITOP 111', 'course_description': 'Object Oriented Programming', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'ECpSD 118', 'course_description': 'Software Design', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'ECpES 128', 'course_description': 'Embedded System', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'ITTE 129', 'course_description': 'Technopreneurship 101', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'second_sem'},
            
            # Third Year - Third Trimester
            {'course_code': 'ECpOJT 111', 'course_description': 'On-the-Job Training (240 Hours)', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'third_sem'},
            {'course_code': 'ECpPD 130', 'course_description': 'CpE Practice and Design 2', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'third_sem'},
            {'course_code': 'ECpSF 123', 'course_description': 'Seminar and Fieldtrips', 'program': 'BSCpE', 'year_level': 'third_year', 'semester': 'third_sem'},
            
            # Fourth Year - First Trimester
            {'course_code': 'ECpDP 127', 'course_description': 'Digital Signal Processing', 'program': 'BSCpE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'ECpCN 117', 'course_description': 'Computer Networks and Security', 'program': 'BSCpE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'ECpSN 124', 'course_description': 'System and Network Administration 1', 'program': 'BSCpE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'ECpBD 126', 'course_description': 'Big Data Analysis', 'program': 'BSCpE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'ECpME 125', 'course_description': 'Microelectronics 1', 'program': 'BSCpE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            
            # ========== BSGE COURSES ==========
            # First Year - First Trimester
            {'course_code': 'EIAM 101', 'course_description': 'Applied Engineering Mathematics', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'EBFP 310', 'course_description': 'Computer Fundamentals and Programming', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'GEUS 201', 'course_description': 'Understanding the Self', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'GEPH 202', 'course_description': 'Readings in Philippine History', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'RESH 401', 'course_description': 'Salvation History', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'PATHFIT 1', 'course_description': 'Physical Activities Toward Health and Fitness Movement Competency Training', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'NSTP 201', 'course_description': 'National Service Training Program 1', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'first_sem'},
            
            # First Year - Second Trimester
            {'course_code': 'EIAS 102', 'course_description': 'Principles of Geometry', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'EBCA 311', 'course_description': 'Computer Aided Design (Land CAD)', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'EMDC 301', 'course_description': 'Differential Calculus', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'ESMS 316', 'course_description': 'Safety Management', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'GECW 203', 'course_description': 'Contemporary World', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'EAES 315', 'course_description': 'Environmental Science and Engineering', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'RECM 402', 'course_description': 'Christology and Mariology', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'PATHFIT 2', 'course_description': 'Physical Activities Toward Health and Fitness Exercise Based Fitness Activities', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'NSTP 202', 'course_description': 'National Service Training Program 2', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'second_sem'},
            
            # First Year - Third Trimester
            {'course_code': 'EMIC 302', 'course_description': 'Integral Calculus', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'EPPE 305', 'course_description': 'Physics for Engineers', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEAA 206', 'course_description': 'Art Appreciation', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEMM 204', 'course_description': 'Mathematics in Modern World', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEPC 205', 'course_description': 'Purposive Communication', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'RELS 403', 'course_description': 'Liturgy and Sacraments, Christian Morality and Social Responsibility with Palawan Environmental Laws', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'PATHFIT 3', 'course_description': 'Physical Activities Toward Health and Fitness Menu of Dance Sports', 'program': 'BSGE', 'year_level': 'first_year', 'semester': 'third_sem'},
            
            # Second Year - First Trimester
            {'course_code': 'EMDA 303', 'course_description': 'Engineering Data Analysis', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'EAIC 312', 'course_description': 'Advanced Information and Communication Technology', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'EBEE 306', 'course_description': 'Engineering Economics', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'EGLP 106', 'course_description': 'Introduction to the Laws on Private and Public Lands', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'GEST 207', 'course_description': 'Science, Technology and Society', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'EGGS 101', 'course_description': 'General Surveying 1', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'RECH 404', 'course_description': 'Church History Catechesis and Church Documents', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'PATHFIT 4', 'course_description': 'Physical Activities Toward Health and Fitness Menu of Outdoor and Adventure Activities', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'first_sem'},
            
            # Second Year - Second Trimester
            {'course_code': 'EMPE 302', 'course_description': 'Differential Equation', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'EGGS 102', 'course_description': 'General Surveying 2', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'EEAE 314', 'course_description': 'Electrical and Electronics Engineering for Geodetic Engineers', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'EBEM 307', 'course_description': 'Engineering Mechanics', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'EGAL 107', 'course_description': 'GE Laws, Obligation and Contracts', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'EGCT 106', 'course_description': 'Cartography', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'GEET 208', 'course_description': 'Ethics', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'second_sem'},
            
            # Second Year - Third Trimester
            {'course_code': 'EGES 104', 'course_description': 'Engineering Survey', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'EGIT 121', 'course_description': 'Geographic Information System', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'GERL 209', 'course_description': 'Life and Works of Rizal', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'EGPL 106', 'course_description': 'Land Registration Laws', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'GELI 210', 'course_description': 'Living in the IT Era', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'GEIC 211', 'course_description': 'Philippine Indigenous Communities', 'program': 'BSGE', 'year_level': 'second_year', 'semester': 'third_sem'},
            
            # Third Year - First Trimester
            {'course_code': 'EGPS 105', 'course_description': 'Property Surveys', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'EGDS 106', 'course_description': 'Geodetic Surveying', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'EGGG 112', 'course_description': 'Geometric Geodesy', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'EGTE 112', 'course_description': 'Theory of Errors and Adjustment', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'EGGL 117', 'course_description': 'Public Land Laws & Laws on Natural Resources', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'GEEM 212', 'course_description': 'The Entrepreneurial Mind', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'first_sem'},
            
            # Third Year - Second Trimester
            {'course_code': 'EGPT 110', 'course_description': 'Photogrammetry', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'EGRS 111', 'course_description': 'Remote Sensing', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'EGHS 116', 'course_description': 'Hydrographic Surveying', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'EBGM 308', 'course_description': 'Engineering Management', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'EGMR 125', 'course_description': 'Methods of Research', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'EBTP 309', 'course_description': 'Technopreneurship', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'EAPG 316', 'course_description': 'Principles of Geology', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'second_sem'},
            
            # Third Year - Third Trimester
            {'course_code': 'EGEI 124', 'course_description': 'Geodetic Engineering Immersion (OJT - 240 hrs)', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'third_sem'},
            {'course_code': 'EGSC 123', 'course_description': 'Survey Camp (120 hrs)', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'third_sem'},
            {'course_code': 'EGSS 126', 'course_description': 'Special Studies in GE', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'third_sem'},
            {'course_code': 'EGDR 122', 'course_description': 'Elective – Disaster Risk Reduction and Management', 'program': 'BSGE', 'year_level': 'third_year', 'semester': 'third_sem'},
            
            # Fourth Year - First Trimester
            {'course_code': 'EGLA 120', 'course_description': 'Land Administration and Management', 'program': 'BSGE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'EGCA 118', 'course_description': 'Geodetic Computations & Adjustments', 'program': 'BSGE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'EPGG 113', 'course_description': 'Physical Geodesy', 'program': 'BSGE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'EDSG 114', 'course_description': 'Satellite Geodesy', 'program': 'BSGE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'EGLU 119', 'course_description': 'Land Use Planning & Development', 'program': 'BSGE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            
            # ========== BSCE COURSES ==========
            # First Year - First Trimester
            {'course_code': 'EBCO 301', 'course_description': 'Civil Engineering Orientation', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'EBDP 302', 'course_description': 'Engineering Drawing and Plans', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'EIAM 101', 'course_description': 'Applied Engineering Mathematics', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'ESCE 301', 'course_description': 'Chemistry for Engineers', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'GEUS 201', 'course_description': 'Understanding the Self', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'RESH 401', 'course_description': 'Salvation History', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'PATHFIT 100', 'course_description': 'Physical Activities Toward Health and Fitness Movement Competency Training', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'NSTP 201', 'course_description': 'National Service Training Program 1', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'first_sem'},
            
            # First Year - Second Trimester
            {'course_code': 'EMDC 301', 'course_description': 'Differential Calculus', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'EBCA 304', 'course_description': 'Computer Aided Drafting', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'EIAS 102', 'course_description': 'Applied Engineering Science', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'GEPH 202', 'course_description': 'Readings in Philippine History', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'GECW 203', 'course_description': 'Contemporary World', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'RECM 402', 'course_description': 'Christology and Mariology', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'PATHFIT 200', 'course_description': 'Physical Activities Toward Health and Fitness Exercise-Based Fitness Activities', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'NSTP 202', 'course_description': 'National Service Training Program 2', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'second_sem'},
            
            # First Year - Third Trimester
            {'course_code': 'EMIC 302', 'course_description': 'Integral Calculus', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'EPPE 302', 'course_description': 'Physics for Engineers', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'EBFP 303', 'course_description': 'Computer Fundamentals and Programming', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEMM 204', 'course_description': 'Mathematics in the Modern World', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEPC 205', 'course_description': 'Purposive Communication', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEES 210', 'course_description': 'Environmental Science with Palawan Environmental Laws', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'RELS 403', 'course_description': 'Liturgy and Sacraments, Christian Morality and Social Responsibility with Palawan Environmental Laws', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'PATHFIT 300', 'course_description': 'Physical Activities Toward Health and Fitness Menu of Dance Sports', 'program': 'BSCE', 'year_level': 'first_year', 'semester': 'third_sem'},
            
            # Second Year - First Trimester
            {'course_code': 'EMDE 304', 'course_description': 'Differential Equation', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'ECFS 101', 'course_description': 'Fundamentals of Surveying', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'EBEE 308', 'course_description': 'Engineering Economics', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'ESGC 303', 'course_description': 'Geology for Engineers', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'GEAA 206', 'course_description': 'Art Appreciation', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'GEST 207', 'course_description': 'Science, Technology and Society', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'RECH 404', 'course_description': 'Church History Catechesis and Church Documents', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'PATHFIT 400', 'course_description': 'Physical Activities Toward Health and Fitness Menu of Outdoor and Adventure Activities', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'first_sem'},
            
            # Second Year - Second Trimester
            {'course_code': 'ECGE 110', 'course_description': 'Soil Mechanics (Geotechnical Engineering 1)', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'ECFM 111', 'course_description': 'Hydraulics 1 (Fluid Mechanics)', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'ECSD 114', 'course_description': 'Building System Design', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'EMDA 303', 'course_description': 'Engineering Data Analysis', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'EBSR 305', 'course_description': 'Statics of Rigid Bodies', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'GEET 208', 'course_description': 'Ethics', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'GERL 209', 'course_description': 'Life and Works of Rizal', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'second_sem'},
            
            # Second Year - Third Trimester
            {'course_code': 'ECHY 112', 'course_description': 'Hydraulics 2', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'EBEM 310', 'course_description': 'Engineering Management', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'ENMS 305', 'course_description': 'Numerical Solutions to CE Problems', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'EBDR 306', 'course_description': 'Dynamics of Rigid Bodies', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'EBMD 307', 'course_description': 'Mechanics of Deformable Bodies', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'EAEU 301', 'course_description': 'Engineering Utilities 1', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'GEIC 211', 'course_description': 'Philippine Indigenous Communities', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'GEEM 212', 'course_description': 'The Entrepreneurial Mind', 'program': 'BSCE', 'year_level': 'second_year', 'semester': 'third_sem'},
            
            # Third Year - First Trimester
            {'course_code': 'ECST 107', 'course_description': 'Structural Theory', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ECHR 102', 'course_description': 'Highway and Railroad Engineering', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ECMT 106', 'course_description': 'Construction Materials and Testing', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ECHD 113', 'course_description': 'Hydrology', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ECMM 106', 'course_description': 'Construction Methods and Project Management', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'ECEC 115', 'course_description': 'CE Laws, Ethics and Contracts', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'EAEU 302', 'course_description': 'Engineering Utilities 2', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'first_sem'},
            
            # Third Year - Second Trimester
            {'course_code': 'ECTE 104', 'course_description': 'Principles of Transportation', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'ECSD 108', 'course_description': 'Principles of Steel Design', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'ECRD 109', 'course_description': 'Principles of Reinforced/Prestressed Concrete', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'ECRP 116', 'course_description': 'CE Project 1 (Research Proposal)', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'ECQS 103', 'course_description': 'Quantity Surveying', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'EBTP 309', 'course_description': 'Technopreneurship', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'second_sem'},
            
            # Third Year - Third Trimester
            {'course_code': 'ECRE 101', 'course_description': 'Engineering Related Experience (240 Hrs)', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'third_sem'},
            {'course_code': 'EIFS 105', 'course_description': 'Field Trips and Seminars', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'third_sem'},
            {'course_code': 'ECRI 117', 'course_description': 'CE Project 2 (Implementation)', 'program': 'BSCE', 'year_level': 'third_year', 'semester': 'third_sem'},
            
            # Fourth Year - First Trimester
            {'course_code': 'EMSS 101', 'course_description': 'COSH (Construction, Occupational, Safety and Health)', 'program': 'BSCE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'EMSP 102', 'course_description': 'Project Construction and Management', 'program': 'BSCE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'EMSD 103', 'course_description': 'Database Management in Construction', 'program': 'BSCE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'EMSM 104', 'course_description': 'Construction Methods and Equipment', 'program': 'BSCE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'EMSC 105', 'course_description': 'Construction Cost Engineering', 'program': 'BSCE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'EIST 104', 'course_description': 'STAAD', 'program': 'BSCE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'ESSS 101', 'course_description': 'Design Steel Structure', 'program': 'BSCE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'ESSC 102', 'course_description': 'Reinforced Concrete Design', 'program': 'BSCE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'ESSE 103', 'course_description': 'Earthquake Engineering', 'program': 'BSCE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'ESSB 104', 'course_description': 'Bridge Engineering', 'program': 'BSCE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'ESSP 105', 'course_description': 'Prestressed Concrete Design', 'program': 'BSCE', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            
            # ========== BSN COURSES ==========
            # First Year - First Trimester
            {'course_code': 'RESH 401', 'course_description': 'Salvation History', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'GEUS 201', 'course_description': 'Understanding the Self', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'GEPH 202', 'course_description': 'Readings in Philippine History', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'GECW 203', 'course_description': 'The Contemporary World', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'NAAP 301', 'course_description': 'Anatomy and Physiology', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'NCTF 100', 'course_description': 'Theoretical Foundation of Nursing', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'first_sem'},
            {'course_code': 'PATHFIT 100', 'course_description': 'Physical Activities Toward Health and Fitness / Movement Competency Training', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'first_sem'},
            
            # First Year - Second Trimester
            {'course_code': 'RECM 402', 'course_description': 'Christology and Mariology', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'GEMM 204', 'course_description': 'Mathematics in the Modern World', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'GEPC 205', 'course_description': 'Purposive Communication', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'NABC 302', 'course_description': 'Biochemistry', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'NCHA 101', 'course_description': 'Health Assessment', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'NCHE 102', 'course_description': 'Health Education', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'second_sem'},
            {'course_code': 'PATHFIT 200', 'course_description': 'Physical Activities Toward Health and Fitness / Exercise-Based Fitness Activities', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'second_sem'},
            
            # First Year - Third Trimester
            {'course_code': 'RELS 403', 'course_description': 'Liturgy and Sacraments, Christian Morality and Social Responsibility with Environmental Laws in Palawan', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEAA 206', 'course_description': 'Art Appreciation', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'GEST 207', 'course_description': 'Science, Technology and Society', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'NSTP 201', 'course_description': 'National Service Training Program', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'NCFN 103', 'course_description': 'Fundamentals of Nursing Practice', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'NAMP 303', 'course_description': 'Microbiology and Parasitology', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'third_sem'},
            {'course_code': 'PATHFIT 300', 'course_description': 'Physical Activities Toward Health and Fitness / Group Exercise', 'program': 'BSN', 'year_level': 'first_year', 'semester': 'third_sem'},
            
            # Second Year - First Trimester
            {'course_code': 'RECH 404', 'course_description': 'Church History, Catechesis and Church Documents', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'GEIT 210', 'course_description': 'Living in the IT Era', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'NALC 304', 'course_description': 'Logical and Critical Thinking', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'GEET 208', 'course_description': 'Ethics', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'NCCN 104', 'course_description': 'Community Health Nursing 1 (Individual and Family as Clients)', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'NCNT 105', 'course_description': 'Nutrition and Diet Therapy', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'NCPH 106', 'course_description': 'Pharmacology', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'first_sem'},
            {'course_code': 'PATHFIT 400', 'course_description': 'Physical Activities Toward Health and Fitness / Outdoor and Adventure Activities', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'first_sem'},
            
            # Second Year - Second Trimester
            {'course_code': 'GEPE 211', 'course_description': 'People and The Earth\'s Ecosystem', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'NCMC 107', 'course_description': 'Care of Mother, Child, Adolescent (Well Clients)', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'NCET 108', 'course_description': 'Health Care Ethics (Bioethics)', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'GERL 209', 'course_description': 'Life and Works of Rizal', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'second_sem'},
            {'course_code': 'NSTP 202', 'course_description': 'National Service Training Program 2', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'second_sem'},
            
            # Second Year - Third Trimester
            {'course_code': 'NCMC 109', 'course_description': 'Care of Mother, Child at Risk or with Problems (Acute and Chronic)', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'NCIT 110', 'course_description': 'Nursing Informatics', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'NCRE 111', 'course_description': 'Nursing Research 1', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'third_sem'},
            {'course_code': 'GEEM 212', 'course_description': 'The Entrepreneurial Mind', 'program': 'BSN', 'year_level': 'second_year', 'semester': 'third_sem'},
            
            # Third Year - First Trimester
            {'course_code': 'NCPO 112', 'course_description': 'Care of Clients with Problems in Nutrition and Gastro-Intestinal, Metabolism and Endocrine, Perception and Coordination (Acute and Chronic)', 'program': 'BSN', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'NCCN 113', 'course_description': 'Community Health Nursing 2 (Population Groups and Community as Clients)', 'program': 'BSN', 'year_level': 'third_year', 'semester': 'first_sem'},
            {'course_code': 'NCOA 114', 'course_description': 'Care of Older Adult', 'program': 'BSN', 'year_level': 'third_year', 'semester': 'first_sem'},
            
            # Third Year - Second Trimester
            {'course_code': 'NCRE 115', 'course_description': 'Nursing Research 2', 'program': 'BSN', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'NCPN 116', 'course_description': 'Care of Clients with Problems in Cardiovascular, Hematopoietic, Immune System, Cellular Aberrations, Acute and Chronic', 'program': 'BSN', 'year_level': 'third_year', 'semester': 'second_sem'},
            {'course_code': 'NCMB 117', 'course_description': 'Care of Clients with Maladaptive Patterns of Behavior (Acute and Chronic)', 'program': 'BSN', 'year_level': 'third_year', 'semester': 'second_sem'},
            
            # Third Year - Third Trimester
            {'course_code': 'NCLT 118-A', 'course_description': 'Care of Clients with Life-threatening Conditions, Acutely Ill/Multi-Organ Problems, High Acuity and Emergency Situations (Acute and Chronic) with Manila Affiliation', 'program': 'BSN', 'year_level': 'third_year', 'semester': 'third_sem'},
            {'course_code': 'NCLM 119', 'course_description': 'Nursing Leadership and Management', 'program': 'BSN', 'year_level': 'third_year', 'semester': 'third_sem'},
            {'course_code': 'NCTN 120', 'course_description': 'Decent Work Employment and Transcultural Nursing', 'program': 'BSN', 'year_level': 'third_year', 'semester': 'third_sem'},
            
            # Summer
            {'course_code': 'NCLT 118-B', 'course_description': 'Tertiary Hospitals Affiliation', 'program': 'BSN', 'year_level': 'third_year', 'semester': 'third_sem'},
            
            # Fourth Year - First Trimester
            {'course_code': 'NCDN 121', 'course_description': 'Disaster Nursing', 'program': 'BSN', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'NCIP 122', 'course_description': 'Intensive Nursing Practicum (Hospital and Community Settings)', 'program': 'BSN', 'year_level': 'fourth_year', 'semester': 'first_sem'},
            {'course_code': 'NCER 123', 'course_description': 'Nursing Care Enhancement', 'program': 'BSN', 'year_level': 'fourth_year', 'semester': 'first_sem'},
        ]
        return raw_courses
    
    def clean_course_code(self, course_code):
        """Clean and normalize course codes."""
        # Remove extra spaces, normalize to uppercase
        code = ' '.join(str(course_code).strip().upper().split())
        # Fix common typos
        code = code.replace('PATH FIT', 'PATHFIT')
        code = code.replace('PATHFIT ', 'PATHFIT')
        return code
    
    def clean_course_title(self, title):
        """Clean and normalize course titles."""
        title = str(title).strip()
        # Fix common typos
        corrections = {
            'Techonology': 'Technology',
            'Methematics': 'Mathematics',
            'Sacrements': 'Sacraments',
            'Resposibility': 'Responsibility',
            'Intergrative': 'Integrative',
            'Dsicrete': 'Discrete',
            'Mathemetics': 'Mathematics',
            'Emering': 'Emerging',
            'Sructures': 'Structures',
            'Catechesis': 'Catechesis'
        }
        for wrong, correct in corrections.items():
            title = title.replace(wrong, correct)
        return title
    
    def determine_units(self, course_code, course_title):
        """Determine units based on course type."""
        course_code_upper = course_code.upper()
        title_upper = course_title.upper()
        
        # NSTP and PATHFIT courses are usually 2 units
        if 'NSTP' in course_code_upper or 'PATHFIT' in course_code_upper:
            return 2.0
        
        # Laboratory courses are usually 4 units
        if any(word in title_upper for word in ['LABORATORY', 'LAB', 'PRACTICUM', 'OJT', 'TRAINING', 'AFFILIATION']):
            return 4.0
        
        # Thesis/Capstone/Research courses are usually 6 units
        if any(word in title_upper for word in ['THESIS', 'CAPSTONE', 'RESEARCH', 'PROJECT']):
            return 6.0
        
        # Default to 3 units for regular courses
        return 3.0
    
    def create_school_years(self):
        """Create sample school years."""
        from datetime import datetime, timedelta
        import pytz
        
        school_years_data = [
            {
                'name': 'Academic Year 2024-2025',
                'code': 'AY2425',
                'start_date': datetime(2024, 6, 1),
                'end_date': datetime(2025, 5, 31),
                'is_active': False
            },
            {
                'name': 'Academic Year 2025-2026',
                'code': 'AY2526',
                'start_date': datetime(2025, 6, 1),
                'end_date': datetime(2026, 5, 31),
                'is_active': True  # Current active year
            },
            {
                'name': 'Academic Year 2026-2027',
                'code': 'AY2627',
                'start_date': datetime(2026, 6, 1),
                'end_date': datetime(2027, 5, 31),
                'is_active': False
            }
        ]
        
        for data in school_years_data:
            school_year, created = SchoolYear.objects.update_or_create(
                code=data['code'],
                defaults=data
            )
            action = "Created" if created else "Updated"
            self.stdout.write(
                self.style.SUCCESS(f"{action} School Year: {school_year.name}")
            )
    
    def create_sample_users(self, colleges, programs):
        """Create sample users for testing (optional)."""
        try:
            from accounts.models import UserProfile, StudentProfile, StaffProfile, UserRole
            from django.contrib.auth import get_user_model
            
            User = get_user_model()
            
            # Create a super admin
            super_admin_user, created = User.objects.get_or_create(
                username='superadmin',
                defaults={
                    'email': 'superadmin@university.edu',
                    'is_staff': True,
                    'is_superuser': True
                }
            )
            if created:
                super_admin_user.set_password('password123')
                super_admin_user.save()
                
                super_admin_profile, _ = UserProfile.objects.get_or_create(
                    email='superadmin@university.edu',
                    defaults={
                        'role': UserRole.SUPER_ADMIN,
                        'is_active': True,
                        'email_verified': True
                    }
                )
                
                StaffProfile.objects.get_or_create(
                    user=super_admin_profile,
                    defaults={
                        'position': 'System Administrator',
                        'is_super_admin': True,
                        'is_college_admin': True
                    }
                )
                self.stdout.write(self.style.SUCCESS('Created Super Admin user'))
            
            # Create a college admin for CET
            cet_admin_user, created = User.objects.get_or_create(
                username='cetadmin',
                defaults={
                    'email': 'cetadmin@university.edu',
                    'is_staff': True
                }
            )
            if created:
                cet_admin_user.set_password('password123')
                cet_admin_user.save()
                
                cet_admin_profile, _ = UserProfile.objects.get_or_create(
                    email='cetadmin@university.edu',
                    defaults={
                        'role': UserRole.COLLEGE_ADMIN,
                        'is_active': True,
                        'email_verified': True
                    }
                )
                
                StaffProfile.objects.get_or_create(
                    user=cet_admin_profile,
                    defaults={
                        'college': colleges['CET'],
                        'position': 'College Administrator',
                        'is_college_admin': True,
                        'employee_id': 'CET-ADMIN-001'
                    }
                )
                self.stdout.write(self.style.SUCCESS('Created CET Admin user'))
            
            # Create a sample instructor
            instructor_user, created = User.objects.get_or_create(
                username='instructor1',
                defaults={
                    'email': 'instructor1@university.edu',
                    'is_staff': True
                }
            )
            if created:
                instructor_user.set_password('password123')
                instructor_user.save()
                
                instructor_profile, _ = UserProfile.objects.get_or_create(
                    email='instructor1@university.edu',
                    defaults={
                        'role': UserRole.INSTRUCTOR,
                        'is_active': True,
                        'email_verified': True
                    }
                )
                
                StaffProfile.objects.get_or_create(
                    user=instructor_profile,
                    defaults={
                        'college': colleges['CET'],
                        'position': 'Assistant Professor',
                        'department': 'Information Technology',
                        'employee_id': 'CET-IT-001',
                        'expertise': ['Programming', 'Database Systems', 'Web Development']
                    }
                )
                self.stdout.write(self.style.SUCCESS('Created Instructor user'))
            
            # Create a sample student
            student_user, created = User.objects.get_or_create(
                username='student1',
                defaults={
                    'email': 'student1@university.edu',
                    'is_staff': False
                }
            )
            if created:
                student_user.set_password('password123')
                student_user.save()
                
                student_profile, _ = UserProfile.objects.get_or_create(
                    email='student1@university.edu',
                    defaults={
                        'role': UserRole.STUDENT,
                        'is_active': True,
                        'email_verified': True
                    }
                )
                
                StudentProfile.objects.get_or_create(
                    user=student_profile,
                    defaults={
                        'student_id': '2023-0001',
                        'college': colleges['CET'],
                        'program': programs['BSIT'],
                        'year_level': 'second_year',
                        'section': 'A',
                        'admission_year': 2023
                    }
                )
                self.stdout.write(self.style.SUCCESS('Created Student user'))
                
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Could not create sample users: {e}'))