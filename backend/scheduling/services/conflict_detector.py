# scheduling/services/conflict_detector.py
from datetime import datetime, time
from django.db.models import Q
from django.utils import timezone
from ..models import ScheduleItem, ScheduleConflict


class ConflictDetector:
    @staticmethod
    def check_all_conflicts(schedule_group):
        """Check all types of conflicts for a schedule group"""
        conflicts = []
        
        # Get all schedule items for the group
        items = ScheduleItem.objects.filter(schedule_group=schedule_group)
        
        for i, item1 in enumerate(items):
            for item2 in items[i+1:]:
                # Check time overlap
                if ConflictDetector._has_time_overlap(item1, item2):
                    conflicts.append(ConflictDetector._create_conflict(
                        item1, item2, ScheduleConflict.ConflictType.TIME_OVERLAP,
                        f"Time overlap between {item1.course.course_code} and {item2.course.course_code}"
                    ))
                
                # Check room conflict
                if item1.room == item2.room and ConflictDetector._has_time_overlap(item1, item2):
                    conflicts.append(ConflictDetector._create_conflict(
                        item1, item2, ScheduleConflict.ConflictType.ROOM,
                        f"Room {item1.room} double booked"
                    ))
                
                # Check instructor conflict
                if (item1.instructor and item2.instructor and 
                    item1.instructor == item2.instructor and 
                    ConflictDetector._has_time_overlap(item1, item2)):
                    conflicts.append(ConflictDetector._create_conflict(
                        item1, item2, ScheduleConflict.ConflictType.INSTRUCTOR,
                        f"Instructor {item1.instructor.user.email} double booked"
                    ))
        
        # Check cross-group conflicts
        cross_conflicts = ConflictDetector._check_cross_group_conflicts(schedule_group)
        conflicts.extend(cross_conflicts)
        
        # Save conflicts
        for conflict_data in conflicts:
            ScheduleConflict.objects.update_or_create(
                schedule_item_1=conflict_data['item1'],
                schedule_item_2=conflict_data['item2'],
                conflict_type=conflict_data['type'],
                defaults={
                    'description': conflict_data['description'],
                    'severity': conflict_data.get('severity', 5),
                    'resolved': False
                }
            )
        
        return conflicts

    @staticmethod
    def _has_time_overlap(item1, item2):
        """Check if two schedule items overlap in time"""
        if item1.day != item2.day:
            return False
        
        # Convert times to datetime for comparison
        start1 = datetime.combine(datetime.today(), item1.start_time)
        end1 = datetime.combine(datetime.today(), item1.end_time)
        start2 = datetime.combine(datetime.today(), item2.start_time)
        end2 = datetime.combine(datetime.today(), item2.end_time)
        
        return start1 < end2 and start2 < end1

    @staticmethod
    def _create_conflict(item1, item2, conflict_type, description, severity=5):
        return {
            'item1': item1,
            'item2': item2,
            'type': conflict_type,
            'description': description,
            'severity': severity
        }

    @staticmethod
    def _check_cross_group_conflicts(schedule_group):
        """Check conflicts with other schedule groups"""
        conflicts = []
        
        # Get same semester groups in same college
        other_groups = ScheduleGroup.objects.filter(
            college=schedule_group.college,
            semester=schedule_group.semester,
            school_year=schedule_group.school_year
        ).exclude(id=schedule_group.id)
        
        for other_group in other_groups:
            other_items = ScheduleItem.objects.filter(schedule_group=other_group)
            current_items = ScheduleItem.objects.filter(schedule_group=schedule_group)
            
            for item1 in current_items:
                for item2 in other_items:
                    # Check room conflicts across groups
                    if item1.room == item2.room and ConflictDetector._has_time_overlap(item1, item2):
                        conflicts.append(ConflictDetector._create_conflict(
                            item1, item2, ScheduleConflict.ConflictType.ROOM,
                            f"Room {item1.room} conflict across {schedule_group.section} and {other_group.section}",
                            severity=7
                        ))
                    
                    # Check instructor conflicts across groups
                    if (item1.instructor and item2.instructor and 
                        item1.instructor == item2.instructor and 
                        ConflictDetector._has_time_overlap(item1, item2)):
                        conflicts.append(ConflictDetector._create_conflict(
                            item1, item2, ScheduleConflict.ConflictType.INSTRUCTOR,
                            f"Instructor conflict across sections",
                            severity=8
                        ))
        
        return conflicts

    @staticmethod
    def bulk_check_conflicts(schedule_items_data):
        """Check conflicts for bulk schedule creation"""
        conflicts = []
        temp_items = []
        
        # Create temporary schedule items for checking
        for data in schedule_items_data:
            temp_item = type('TempItem', (), {
                'day': data['day'],
                'start_time': data['start_time'],
                'end_time': data['end_time'],
                'room': data.get('room'),
                'instructor_id': data.get('instructor_id')
            })()
            temp_items.append(temp_item)
        
        # Check conflicts among temp items
        for i, item1 in enumerate(temp_items):
            for item2 in temp_items[i+1:]:
                if ConflictDetector._has_time_overlap(item1, item2):
                    if item1.room and item2.room and item1.room == item2.room:
                        conflicts.append({
                            'type': 'room',
                            'description': f"Room {item1.room} conflict",
                            'items': [item1.__dict__, item2.__dict__]
                        })
                    elif (item1.instructor_id and item2.instructor_id and 
                          item1.instructor_id == item2.instructor_id):
                        conflicts.append({
                            'type': 'instructor',
                            'description': f"Instructor conflict",
                            'items': [item1.__dict__, item2.__dict__]
                        })
        
        return conflicts