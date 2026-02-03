# scheduling/utils/conflict_utils.py
from datetime import time
from typing import List, Dict, Any


def is_row_complete(row_data: Dict[str, Any]) -> bool:
    """
    Check if a schedule row is complete for conflict checking.
    Frontend should use similar logic.
    """
    return all([
        row_data.get('day'),
        row_data.get('start_time'),
        row_data.get('end_time'),
        row_data.get('room'),
        # Instructor can be empty if using instructor_override
        row_data.get('instructor_id') or row_data.get('instructor_override')
    ])


def check_local_conflicts(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Check conflicts among unsaved rows (frontend should implement this).
    This is a reference implementation for the frontend.
    
    Returns conflicts in similar format to backend conflicts.
    """
    conflicts = []
    
    for i, row1 in enumerate(rows):
        if not is_row_complete(row1):
            continue
            
        for j, row2 in enumerate(rows[i+1:], start=i+1):
            if not is_row_complete(row2):
                continue
            
            # Check if same day and times overlap
            if (row1['day'] == row2['day'] and 
                ConflictDetector._has_time_overlap_simple(
                    row1['start_time'], row1['end_time'],
                    row2['start_time'], row2['end_time']
                )):
                
                # Room conflict
                if row1['room'] == row2['room']:
                    conflicts.append({
                        'row_ids': [i, j],
                        'type': 'room',
                        'severity': 9,
                        'message': f"Room {row1['room']} conflict between rows {i+1} and {j+1}",
                        'source': 'local'
                    })
                
                # Instructor conflict
                instructor1 = row1.get('instructor_id') or row1.get('instructor_override')
                instructor2 = row2.get('instructor_id') or row2.get('instructor_override')
                
                if instructor1 and instructor2 and instructor1 == instructor2:
                    conflicts.append({
                        'row_ids': [i, j],
                        'type': 'instructor',
                        'severity': 8,
                        'message': f"Instructor conflict between rows {i+1} and {j+1}",
                        'source': 'local'
                    })
    
    return conflicts


def merge_conflicts(db_conflicts: List[Dict], local_conflicts: List[Dict]) -> Dict[int, List[Dict]]:
    """
    Merge database and local conflicts by row index.
    Returns dictionary mapping row index to list of conflicts.
    """
    row_conflicts = {}
    
    # Add local conflicts
    for conflict in local_conflicts:
        for row_id in conflict.get('row_ids', []):
            if row_id not in row_conflicts:
                row_conflicts[row_id] = []
            row_conflicts[row_id].append(conflict)
    
    # Database conflicts are already tied to specific rows
    # (They come from the row that triggered the check)
    
    return row_conflicts