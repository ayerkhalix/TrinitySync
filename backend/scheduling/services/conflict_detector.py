# scheduling/services/conflict_detector.py
from datetime import datetime, time
from django.db.models import Q
from django.utils import timezone
from ..models import ScheduleItem, ScheduleConflict, ScheduleGroup


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
                        f"Instructor {item1.instructor.user.email if item1.instructor and hasattr(item1.instructor, 'user') else 'Unknown'} double booked"
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
        
        # Use simple time comparison
        return item1.start_time < item2.end_time and item2.start_time < item1.end_time

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
                if ConflictDetector._has_time_overlap_simple(
                    item1.start_time, item1.end_time,
                    item2.start_time, item2.end_time
                ):
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
    
    @staticmethod
    def check_candidate_conflicts_with_db(
        *,
        day,
        start_time,
        end_time,
        room,
        instructor_id,
        schedule_group,
        exclude_item_id=None,
    ):
        """
        Check a SINGLE UNSAVED schedule row against DATABASE schedules only.
        No DB writes.
        
        Args:
            day: Day of week (e.g., 'MON')
            start_time: time object
            end_time: time object
            room: string room identifier
            instructor_id: UUID of instructor (or None)
            schedule_group: ScheduleGroup instance for context
            exclude_item_id: Optional item ID to exclude (when editing)
        
        Returns:
            List of conflict dictionaries
        """
        conflicts = []
        
        # Get base query for same semester and school year
        base_qs = ScheduleItem.objects.filter(
            schedule_group__school_year=schedule_group.school_year,
            schedule_group__semester=schedule_group.semester,
            day=day
        )
        
        # Optional: Exclude specific item when editing
        if exclude_item_id:
            base_qs = base_qs.exclude(id=exclude_item_id)
        
        # Use .only() to reduce payload
        base_qs = base_qs.select_related(
            'course',
            'schedule_group',
            'instructor__user'
        ).only(
            'id',
            'room',
            'start_time',
            'end_time',
            'instructor_id',
            'course__course_code',
            'course__course_title',
            'schedule_group__id',
            'schedule_group__section',
            'instructor__user__email'
        )
        
        # Efficient single pass through all relevant schedule items
        for item in base_qs:
            has_time_overlap = ConflictDetector._has_time_overlap_simple(
                start_time, end_time,
                item.start_time, item.end_time
            )
            
            if not has_time_overlap:
                continue
            
            # Check room conflicts (including same group)
            if room == item.room:
                conflicts.append({
                    "type": ScheduleConflict.ConflictType.ROOM,
                    "severity": 9,
                    "message": f"Room {room} already booked for {item.course.course_code} "
                             f"({item.day} {item.start_time}-{item.end_time})",
                    "source": "database",
                    "conflicting_item_id": str(item.id),
                    "conflicting_course_code": item.course.course_code,
                    "conflicting_course_title": item.course.course_title,
                    "conflicting_schedule_group": str(item.schedule_group.id),
                    "conflicting_section": item.schedule_group.section,
                })
            
            # Check instructor conflicts
            if instructor_id and item.instructor_id and instructor_id == item.instructor_id:
                # Safe instructor name access
                instructor_name = (
                    item.instructor.user.email
                    if item.instructor and hasattr(item.instructor, 'user')
                    else "Instructor"
                )
                
                conflicts.append({
                    "type": ScheduleConflict.ConflictType.INSTRUCTOR,
                    "severity": 8,
                    "message": f"Instructor {instructor_name} already teaching "
                             f"{item.course.course_code} "
                             f"({item.day} {item.start_time}-{item.end_time})",
                    "source": "database",
                    "conflicting_item_id": str(item.id),
                    "conflicting_course_code": item.course.course_code,
                    "conflicting_course_title": item.course.course_title,
                    "conflicting_schedule_group": str(item.schedule_group.id),
                    "conflicting_section": item.schedule_group.section,
                    "conflicting_room": item.room,
                })
            
            # Check if this is the same schedule group (student conflict)
            if item.schedule_group_id == schedule_group.id:
                conflicts.append({
                    "type": ScheduleConflict.ConflictType.SECTION,
                    "severity": 7,
                    "message": f"Time overlap with {item.course.course_code} "
                             f"in same section ({item.day} {item.start_time}-{item.end_time})",
                    "source": "database",
                    "conflicting_item_id": str(item.id),
                    "conflicting_course_code": item.course.course_code,
                    "conflicting_course_title": item.course.course_title,
                })
        
        return conflicts
    
    @staticmethod
    def _has_time_overlap_simple(start1, end1, start2, end2):
        """
        Simple time overlap check using time objects.
        Returns True if intervals overlap.
        """
        return start1 < end2 and start2 < end1