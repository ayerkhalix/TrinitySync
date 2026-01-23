# schedules/services/conflict_detector.py
class ConflictDetector:
    @staticmethod
    def check_time_slot_conflict(time_slot1, time_slot2):
        """Check if two time slots overlap"""
        # Parse time slots like "8:00 AM - 11:00 AM"
        def parse_time(time_str):
            import re
            time_str = time_str.strip().upper()
            # Remove AM/PM and split
            parts = re.split(r'[:-]', time_str.replace(' AM', '').replace(' PM', ''))
            hour = int(parts[0].strip())
            minute = int(parts[1].strip()) if len(parts) > 1 else 0
            
            # Convert to 24-hour format
            if 'PM' in time_str and hour < 12:
                hour += 12
            if 'AM' in time_str and hour == 12:
                hour = 0
                
            return hour * 60 + minute
        
        if not time_slot1 or not time_slot2:
            return False
            
        try:
            # Split into start and end times
            start1, end1 = time_slot1.split('-')
            start2, end2 = time_slot2.split('-')
            
            # Convert to minutes
            start1_min = parse_time(start1)
            end1_min = parse_time(end1)
            start2_min = parse_time(start2)
            end2_min = parse_time(end2)
            
            # Check for overlap
            return not (end1_min <= start2_min or end2_min <= start1_min)
        except:
            return False
    
    @staticmethod
    def check_schedule_conflicts(schedule_data, exclude_id=None):
        """Check for conflicts with existing schedules"""
        from ..models import ScheduleEntry
        
        conflicts = []
        time_slot = schedule_data.get('time_slot')
        days = schedule_data.get('days')
        room_id = schedule_data.get('room')
        instructor_id = schedule_data.get('instructor')
        semester = schedule_data.get('semester')
        year_level = schedule_data.get('year_level')
        
        # Get existing schedules for the same semester and year level
        existing_schedules = ScheduleEntry.objects.filter(
            semester=semester,
            year_level=year_level
        )
        
        if exclude_id:
            existing_schedules = existing_schedules.exclude(id=exclude_id)
        
        for schedule in existing_schedules:
            # Check if days overlap (handle combined days like "Monday/Tuesday")
            days1 = set(days.split('/'))
            days2 = set(schedule.days.split('/'))
            
            if not days1.intersection(days2):
                continue  # No day overlap, no conflict
            
            # Check time slot overlap
            if not ConflictDetector.check_time_slot_conflict(time_slot, schedule.time_slot):
                continue  # No time overlap, no conflict
            
            # Check room conflict
            if str(room_id) == str(schedule.room_id):
                conflicts.append({
                    'type': 'room',
                    'message': f'Room conflict: {schedule.room.code} already occupied at {schedule.time_slot} on {schedule.days}',
                    'existing_schedule': schedule.id,
                    'conflicting_with': schedule.course.code
                })
            
            # Check instructor conflict
            if str(instructor_id) == str(schedule.instructor_id):
                conflicts.append({
                    'type': 'instructor',
                    'message': f'Instructor {schedule.instructor.full_name} already teaching {schedule.course.code} at {schedule.time_slot} on {schedule.days}',
                    'existing_schedule': schedule.id,
                    'conflicting_with': schedule.course.code
                })
        
        return conflicts